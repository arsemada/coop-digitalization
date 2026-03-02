package com.coop.ussd.service;

import com.coop.loan.entity.Loan;
import com.coop.loan.entity.LoanPolicy;
import com.coop.loan.entity.LoanStatus;
import com.coop.loan.repository.LoanPolicyRepository;
import com.coop.loan.repository.LoanRepository;
import com.coop.member.entity.Member;
import com.coop.member.repository.MemberRepository;
import com.coop.savings.entity.MemberSavingsAccount;
import com.coop.savings.repository.MemberSavingsAccountRepository;
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

    /**
     * Process USSD request and return response text (CON or END).
     * Stateless: menu depth is derived from request.text split by "*".
     */
    public String handle(UssdSessionState state, String phoneNumber) {
        Optional<Member> memberOpt = findMemberByPhone(phoneNumber);
        String normalizedPhone = memberOpt.map(m -> m.getPhone() != null ? m.getPhone() : "").orElse(normalizePhoneForDisplay(phoneNumber));

        // Empty or no steps → Main menu (always show, even if member not found - they can still see options)
        if (state.getDepth() == 0) {
            return buildMainMenu(phoneNumber);
        }

        String choice = state.getMainChoice();
        if (choice == null) {
            return end("Invalid option. Please try again.");
        }

        // 4 = Exit
        if ("4".equals(choice)) {
            return end("Thank you for using " + getSaccoName(memberOpt) + ". Goodbye.");
        }

        // 1, 2, 3 require member
        if (memberOpt.isEmpty()) {
            return end("Phone number not registered. Please visit your SACCO.");
        }
        Member member = memberOpt.get();

        // Step 1: only main choice selected → ask for PIN
        if (state.getDepth() == 1) {
            if ("1".equals(choice)) {
                return con("Enter your PIN:");
            }
            if ("2".equals(choice)) {
                return con("Enter your PIN:");
            }
            if ("3".equals(choice)) {
                return con("Enter your PIN:");
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
                return con("Enter loan amount in ETB:");
            }
            // Depth 3: amount entered
            String amountStr = state.getLoanAmountInput();
            return handleApplyLoan(member, amountStr);
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
                        "4. Exit"
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
        Optional<Member> m = memberRepository.findByPhone(canonical);
        if (m.isPresent()) return m;
        String zeroPrefix = toZeroPrefixPhone(canonical);
        return memberRepository.findByPhone(zeroPrefix);
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
