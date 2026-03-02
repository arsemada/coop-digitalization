package com.coop.ussd.service;

import com.coop.loan.entity.Loan;
import com.coop.loan.entity.LoanPolicy;
import com.coop.loan.entity.LoanStatus;
import com.coop.loan.repository.LoanPolicyRepository;
import com.coop.loan.repository.LoanRepository;
import com.coop.member.entity.Member;
import com.coop.member.repository.MemberRepository;
import com.coop.savings.entity.MemberSavingsAccount;
import com.coop.savings.entity.TransferRequest;
import com.coop.savings.entity.TransferRequestStatus;
import com.coop.savings.repository.MemberSavingsAccountRepository;
import com.coop.savings.repository.TransferRequestRepository;
import com.coop.ussd.session.UssdSessionState;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UssdService {

    private static final BCryptPasswordEncoder PIN_ENCODER = new BCryptPasswordEncoder();

    private final MemberRepository memberRepository;
    private final MemberSavingsAccountRepository memberSavingsAccountRepository;
    private final LoanPolicyRepository loanPolicyRepository;
    private final LoanRepository loanRepository;
    private final TransferRequestRepository transferRequestRepository;

    /**
     * Process USSD request and return response text (CON or END).
     * Stateless: menu depth is derived from request.text split by "*".
     */
    public String handle(UssdSessionState state, String phoneNumber) {
        Optional<Member> memberOpt = findMemberByPhone(phoneNumber);
        String normalizedPhone = memberOpt.map(m -> m.getPhone() != null ? m.getPhone() : "").orElse(normalizePhoneForDisplay(phoneNumber));

        int depth = state.getDepth();
        // Empty or no steps → Main menu (always show, even if member not found - they can still see options)
        if (depth == 0) {
            return buildMainMenu(phoneNumber);
        }
        // Global "0" → go back to main menu from any level
        String lastStep = state.getStep(depth - 1);
        if ("0".equals(lastStep)) {
            return buildMainMenu(phoneNumber);
        }

        String choice = state.getMainChoice();
        if (choice == null) {
            return end("Invalid option. Please try again.");
        }

        // 5 = Exit
        if ("5".equals(choice)) {
            return end("Thank you for using " + getSaccoName(memberOpt) + ". Goodbye.");
        }

        // 1, 2, 3 require member
        if (memberOpt.isEmpty()) {
            return end("Phone number not registered. Please visit your SACCO.");
        }
        Member member = memberOpt.get();

        // Step 1: only main choice selected → ask for PIN
        if (state.getDepth() == 1) {
            if ("1".equals(choice) || "2".equals(choice) || "3".equals(choice) || "4".equals(choice)) {
                return con("Enter your PIN:\n0. Back to main menu");
            }
            return end("Invalid option.");
        }

        // Step 2: PIN entered
        String pin = state.getPin();
        if (pin == null || pin.trim().isEmpty()) {
            return end("Invalid PIN. Please try again.");
        }
        if (!verifyPin(member, pin.trim())) {
            return end("Invalid PIN");
        }

        // Option 1: Savings Balance
        if ("1".equals(choice)) {
            return handleSavingsSummary(member);
        }

        // Option 2: Loan Eligibility
        if ("2".equals(choice)) {
            return handleLoanEligibility(member);
        }

        // Option 3: Apply Loan
        if ("3".equals(choice)) {
            if (state.getDepth() == 2) {
                return con("Enter loan amount in ETB:\n0. Back to main menu");
            }
            // Depth 3: amount entered
            String amountStr = state.getLoanAmountInput();
            return handleApplyLoan(member, amountStr);
        }

        // Option 4: Transfer (create transfer request)
        if ("4".equals(choice)) {
            return handleTransfer(member, state);
        }

        return end("Invalid option.");
    }

    private String buildMainMenu(String phoneNumber) {
        Optional<Member> memberOpt = findMemberByPhone(phoneNumber);
        String saccoName = getSaccoName(memberOpt);
        return con(
                "Welcome to " + saccoName + "\n" +
                        "1. Savings Balance\n" +
                        "2. Loan Eligibility\n" +
                        "3. Apply Loan\n" +
                        "4. Transfer\n" +
                        "5. Exit"
        );
    }

    private String getSaccoName(Optional<Member> memberOpt) {
        if (memberOpt.isPresent()) {
            return memberOpt.get().getSacco().getName();
        }
        return "SACCO";
    }

    private String handleSavingsSummary(Member member) {
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findByMemberId(member.getId());
        if (accounts.isEmpty()) {
            return end("No savings accounts found.");
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Savings Summary:\n");
        for (MemberSavingsAccount acc : accounts) {
            String productName = acc.getSavingsProduct().getName();
            BigDecimal balance = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            BigDecimal locked = acc.getLockedAmount() != null ? acc.getLockedAmount() : BigDecimal.ZERO;
            BigDecimal available = balance.subtract(locked).max(BigDecimal.ZERO);
            sb.append("- ").append(productName).append("\n");
            sb.append("  Balance: ").append(formatMoney(balance)).append(" ETB\n");
            sb.append("  Locked: ").append(formatMoney(locked)).append(" ETB\n");
            sb.append("  Available: ").append(formatMoney(available)).append(" ETB\n");
        }
        return end(sb.toString().trim());
    }

    private String handleLoanEligibility(Member member) {
        BigDecimal eligibleSavings = computeEligibleSavings(member.getId());
        LoanPolicy policy = loanPolicyRepository.findByInstitutionIdAndIsActiveTrue(member.getSacco().getId())
                .orElse(null);
        BigDecimal multiplier = policy != null && policy.getSavingsToLoanMultiplier() != null
                ? policy.getSavingsToLoanMultiplier()
                : BigDecimal.valueOf(3);
        BigDecimal minRequired = policy != null && policy.getMinSavingsRequired() != null
                ? policy.getMinSavingsRequired()
                : BigDecimal.ZERO;
        if (eligibleSavings.compareTo(minRequired) < 0) {
            return end("Minimum savings required: " + formatMoney(minRequired) + " ETB. You have " + formatMoney(eligibleSavings) + " ETB.");
        }
        BigDecimal maxLoan = eligibleSavings.multiply(multiplier).setScale(2, java.math.RoundingMode.DOWN);
        return end("Maximum Loan Allowed: " + formatMoney(maxLoan) + " ETB");
    }

    /**
     * Transfer flow (option 4):
     * depth 2: 4*PIN                 → select source account
     * depth 3: 4*PIN*idx             → enter destination account
     * depth 4: 4*PIN*idx*dest        → enter amount
     * depth 5: 4*PIN*idx*dest*amount → create transfer request (PENDING)
     */
    private String handleTransfer(Member member, UssdSessionState state) {
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findByMemberId(member.getId()).stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .toList();
        if (accounts.isEmpty()) {
            return end("No active savings accounts found.");
        }

        int depth = state.getDepth();
        // Step 1 inside transfer: choose source account
        if (depth == 2) {
            StringBuilder sb = new StringBuilder();
            sb.append("Select source account:\n");
            for (int i = 0; i < accounts.size(); i++) {
                MemberSavingsAccount acc = accounts.get(i);
                String accNo = acc.getAccountNumber() != null ? acc.getAccountNumber() : "SAV-" + String.format("%06d", acc.getId());
                BigDecimal balance = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
                BigDecimal locked = acc.getLockedAmount() != null ? acc.getLockedAmount() : BigDecimal.ZERO;
                BigDecimal available = balance.subtract(locked).max(BigDecimal.ZERO);
                sb.append(i + 1)
                        .append(". ")
                        .append(acc.getSavingsProduct().getName())
                        .append(" - ")
                        .append(accNo)
                        .append(" (Avail: ")
                        .append(formatMoney(available))
                        .append(")\n");
            }
            sb.append("0. Back to main menu");
            return con(sb.toString());
        }

        // Need valid source account index
        String srcIdxStr = state.getStep(2);
        int idx;
        try {
            idx = Integer.parseInt(srcIdxStr) - 1;
        } catch (Exception e) {
            return end("Invalid account choice.");
        }
        if (idx < 0 || idx >= accounts.size()) {
            return end("Invalid account choice.");
        }
        MemberSavingsAccount source = accounts.get(idx);

        // Step 2 inside transfer: enter destination account number
        if (depth == 3) {
            return con("Enter destination account number:\n0. Back to main menu");
        }

        String destNumber = state.getStep(3);
        if (destNumber == null || destNumber.trim().isEmpty()) {
            return end("Destination account number is required.");
        }
        destNumber = destNumber.trim().toUpperCase();

        // Step 3 inside transfer: enter amount
        if (depth == 4) {
            return con("Enter amount in ETB:\n0. Back to main menu");
        }

        String amountStr = state.getStep(4);
        if (amountStr == null || amountStr.trim().isEmpty()) {
            return end("Invalid amount. Please try again.");
        }
        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr.trim());
        } catch (NumberFormatException e) {
            return end("Invalid amount. Enter numbers only.");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return end("Amount must be positive.");
        }

        BigDecimal balance = source.getBalance() != null ? source.getBalance() : BigDecimal.ZERO;
        BigDecimal locked = source.getLockedAmount() != null ? source.getLockedAmount() : BigDecimal.ZERO;
        BigDecimal available = balance.subtract(locked).max(BigDecimal.ZERO);
        if (available.compareTo(amount) < 0) {
            return end("Insufficient available balance.");
        }

        String sourceNumber = source.getAccountNumber() != null ? source.getAccountNumber() : "SAV-" + String.format("%06d", source.getId());
        if (destNumber.equalsIgnoreCase(sourceNumber)) {
            return end("Cannot transfer to the same account.");
        }

        TransferRequest tr = new TransferRequest();
        tr.setSourceAccount(source);
        tr.setDestinationAccountNumber(destNumber);
        tr.setAmount(amount);
        tr.setStatus(TransferRequestStatus.PENDING);
        transferRequestRepository.save(tr);

        return end("Transfer request submitted. SACCO will approve and complete it.");
    }

    @Transactional
    private String handleApplyLoan(Member member, String amountStr) {
        if (amountStr == null || amountStr.trim().isEmpty()) {
            return end("Invalid amount. Please try again.");
        }
        BigDecimal requestedAmount;
        try {
            requestedAmount = new BigDecimal(amountStr.trim()).setScale(2, java.math.RoundingMode.UNNECESSARY);
        } catch (NumberFormatException e) {
            return end("Invalid amount. Enter numbers only.");
        }
        if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return end("Amount must be positive.");
        }

        BigDecimal eligibleSavings = computeEligibleSavings(member.getId());
        LoanPolicy policy = loanPolicyRepository.findByInstitutionIdAndIsActiveTrue(member.getSacco().getId())
                .orElse(null);
        BigDecimal multiplier = policy != null && policy.getSavingsToLoanMultiplier() != null
                ? policy.getSavingsToLoanMultiplier()
                : BigDecimal.valueOf(3);
        BigDecimal maxLoan = eligibleSavings.multiply(multiplier).setScale(2, java.math.RoundingMode.DOWN);

        if (requestedAmount.compareTo(maxLoan) > 0) {
            return end("Amount exceeds maximum allowed (" + formatMoney(maxLoan) + " ETB).");
        }

        // Use first active savings account as collateral for USSD flow
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findByMemberId(member.getId()).stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .collect(Collectors.toList());
        MemberSavingsAccount collateral = accounts.isEmpty() ? null : accounts.get(0);

        Loan loan = new Loan();
        loan.setMember(member);
        loan.setSacco(member.getSacco());
        loan.setPrincipalAmount(requestedAmount);
        loan.setInterestRate(member.getSacco().getDefaultLoanInterestRate() != null
                ? member.getSacco().getDefaultLoanInterestRate()
                : BigDecimal.valueOf(12));
        loan.setTermInMonths(12);
        loan.setLoanReason("USSD Application");
        loan.setCollateralSavingsAccount(collateral);
        loan.setStatus(LoanStatus.PENDING_APPROVAL);
        loanRepository.save(loan);

        return end("Loan Application Submitted");
    }

    private BigDecimal computeEligibleSavings(Long memberId) {
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findByMemberId(memberId);
        BigDecimal sum = BigDecimal.ZERO;
        for (MemberSavingsAccount acc : accounts) {
            if (!"ACTIVE".equals(acc.getStatus())) continue;
            BigDecimal balance = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            BigDecimal locked = acc.getLockedAmount() != null ? acc.getLockedAmount() : BigDecimal.ZERO;
            sum = sum.add(balance.subtract(locked).max(BigDecimal.ZERO));
        }
        return sum;
    }

    private boolean verifyPin(Member member, String rawPin) {
        String hash = member.getPinHash();
        if (hash == null || hash.isBlank()) {
            return false;
        }
        return PIN_ENCODER.matches(rawPin, hash);
    }

    public static String hashPin(String rawPin) {
        return PIN_ENCODER.encode(rawPin);
    }

    /** Look up member by phone; accepts 0918..., +251918..., 251918... (Ethiopia). */
    private Optional<Member> findMemberByPhone(String phone) {
        if (phone == null || phone.isBlank()) return Optional.empty();
        String canonical = toCanonicalPhone(phone);
        String zeroPrefix = toZeroPrefixPhone(canonical);
        String plusCanonical = "+" + canonical;

        // Try canonical (251...), then 0-prefix, then +251... for older records
        Optional<Member> m = memberRepository.findByPhone(canonical);
        if (m.isPresent()) return m;
        m = memberRepository.findByPhone(zeroPrefix);
        if (m.isPresent()) return m;
        return memberRepository.findByPhone(plusCanonical);
    }

    /** Canonical form: 251918781174. Used for display when member not found. */
    private static String normalizePhoneForDisplay(String phone) {
        if (phone == null) return "";
        return toCanonicalPhone(phone.replaceAll("\\s+", "").trim());
    }

    /** 0918781174 or +251918781174 → 251918781174 */
    private static String toCanonicalPhone(String phone) {
        if (phone == null || phone.isBlank()) return "";
        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("251") && digits.length() >= 12) return digits;
        if (digits.startsWith("0") && digits.length() > 1) return "251" + digits.substring(1);
        if (!digits.isEmpty()) return "251" + digits;
        return phone.replaceAll("\\s+", "").trim();
    }

    /** 251918781174 → 0918781174 (for lookup when stored as 0-prefix) */
    private static String toZeroPrefixPhone(String canonical) {
        if (canonical == null || !canonical.startsWith("251") || canonical.length() < 12) return canonical != null ? canonical : "";
        return "0" + canonical.substring(3);
    }

    private static String formatMoney(BigDecimal amount) {
        if (amount == null) return "0.00";
        return amount.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }

    private static String con(String message) {
        return "CON " + message;
    }

    private static String end(String message) {
        return "END " + message;
    }
}
