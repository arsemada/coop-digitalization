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
     * Flow: Language Selection → PIN → Main Menu → Services
     */
    public String handle(UssdSessionState state, String phoneNumber) {
        Optional<Member> memberOpt = findMemberByPhone(phoneNumber);
        int depth = state.getDepth();

        // Step 0: Language selection
        if (depth == 0) {
            return buildLanguageMenu();
        }

        // Get language choice
        String langChoice = state.getStep(0);
        if (langChoice == null || !isValidLanguage(langChoice)) {
            return end("Invalid language selection. Please enter 1, 2, 3, or 4.");
        }

        // Step 1: After language, ask for PIN
        if (depth == 1) {
            if (memberOpt.isEmpty()) {
                return end(translate("Phone number not registered. Please visit your SACCO.", langChoice));
            }
            return con(translate("Enter your 4-digit PIN:", langChoice) + "\n0. " + translate("Back", langChoice));
        }

        // Verify member exists
        if (memberOpt.isEmpty()) {
            return end(translate("Phone number not registered. Please visit your SACCO.", langChoice));
        }
        Member member = memberOpt.get();

        // Step 2: PIN entered, show main menu
        String pin = state.getStep(1);
        if (pin == null || pin.trim().isEmpty()) {
            return end(translate("Invalid PIN. Please try again.", langChoice));
        }
        if ("0".equals(pin)) {
            return buildLanguageMenu();
        }
        if (!verifyPin(member, pin.trim())) {
            return end(translate("Invalid PIN", langChoice));
        }

        // Step 3: Main menu choice
        if (depth == 2) {
            return buildMainMenu(member, langChoice);
        }

        String mainChoice = state.getStep(2);
        
        // Global back/exit check for depth > 3 (after selecting a service)
        if (depth > 3) {
            String lastInput = state.getStep(depth - 1);
            if ("0".equals(lastInput)) {
                return buildMainMenu(member, langChoice);
            }
            if ("5".equals(lastInput)) {
                return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
            }
        }
        
        if ("0".equals(mainChoice)) {
            return buildMainMenu(member, langChoice);
        }

        // 5 = Exit
        if ("5".equals(mainChoice)) {
            return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
        }

        // Handle service options
        if ("1".equals(mainChoice)) {
            return handleSavingsSummary(member, langChoice);
        }

        if ("2".equals(mainChoice)) {
            return handleLoanEligibility(member, state, langChoice);
        }

        if ("3".equals(mainChoice)) {
            return handleApplyLoan(member, state, langChoice);
        }

        if ("4".equals(mainChoice)) {
            return handleTransfer(member, state, langChoice);
        }

        return end(translate("Invalid option.", langChoice));
    }

    private String buildLanguageMenu() {
        return con(
                "Welcome to SACCO USSD\n" +
                "Select Language / ቋንቋ ምረጽ:\n" +
                "1. English\n" +
                "2. Amharic (አማርኛ)\n" +
                "3. Oromiffa (Afaan Oromoo)\n" +
                "4. Tigrigna (ትግርኛ)"
        );
    }

    private boolean isValidLanguage(String choice) {
        return "1".equals(choice) || "2".equals(choice) || "3".equals(choice) || "4".equals(choice);
    }

    private String buildMainMenu(Member member, String langChoice) {
        String saccoName = member.getSacco().getName();
        return con(
                translate("Welcome to", langChoice) + " " + saccoName + "\n" +
                "1. " + translate("Savings Balance", langChoice) + "\n" +
                "2. " + translate("Loan Eligibility", langChoice) + "\n" +
                "3. " + translate("Apply for Loan", langChoice) + "\n" +
                "4. " + translate("Transfer Money", langChoice) + "\n" +
                "5. " + translate("Exit", langChoice) + "\n" +
                "0. " + translate("Back", langChoice)
        );
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

    private String handleSavingsSummary(Member member, String langChoice) {
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findByMemberId(member.getId());
        if (accounts.isEmpty()) {
            return end(translate("No savings accounts found.", langChoice));
        }
        StringBuilder sb = new StringBuilder();
        sb.append(translate("Savings Summary:", langChoice)).append("\n");
        for (MemberSavingsAccount acc : accounts) {
            String productName = acc.getSavingsProduct().getName();
            BigDecimal balance = acc.getBalance() != null ? acc.getBalance() : BigDecimal.ZERO;
            BigDecimal locked = acc.getLockedAmount() != null ? acc.getLockedAmount() : BigDecimal.ZERO;
            BigDecimal available = balance.subtract(locked).max(BigDecimal.ZERO);
            sb.append("- ").append(productName).append("\n");
            sb.append("  ").append(translate("Balance:", langChoice)).append(" ").append(formatMoney(balance)).append(" ETB\n");
            sb.append("  ").append(translate("Locked:", langChoice)).append(" ").append(formatMoney(locked)).append(" ETB\n");
            sb.append("  ").append(translate("Available:", langChoice)).append(" ").append(formatMoney(available)).append(" ETB\n");
        }
        return end(sb.toString().trim());
    }

    private String handleLoanEligibility(Member member, UssdSessionState state, String langChoice) {
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
            return end(translate("Minimum savings required:", langChoice) + " " + formatMoney(minRequired) + " ETB. " +
                    translate("You have", langChoice) + " " + formatMoney(eligibleSavings) + " ETB.");
        }
        BigDecimal maxLoan = eligibleSavings.multiply(multiplier).setScale(2, java.math.RoundingMode.DOWN);
        return end(translate("Maximum Loan Allowed:", langChoice) + " " + formatMoney(maxLoan) + " ETB");
    }

    /**
     * Transfer flow (option 4):
     * depth 3: lang*PIN*4              → select source account
     * depth 4: lang*PIN*4*idx          → enter destination account
     * depth 5: lang*PIN*4*idx*dest     → enter amount
     * depth 6: lang*PIN*4*idx*dest*amt → create transfer request (PENDING)
     */
    private String handleTransfer(Member member, UssdSessionState state, String langChoice) {
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findByMemberId(member.getId()).stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .toList();
        if (accounts.isEmpty()) {
            return con(translate("No active savings accounts found.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }

        int depth = state.getDepth();
        
        // Check for back/exit at any depth
        String lastInput = state.getStep(depth - 1);
        if ("0".equals(lastInput) && depth > 3) {
            return buildMainMenu(member, langChoice);
        }
        if ("5".equals(lastInput) && depth > 3) {
            return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
        }
        
        // Step 1 inside transfer: choose source account (depth 3)
        if (depth == 3) {
            StringBuilder sb = new StringBuilder();
            sb.append(translate("Select source account:", langChoice)).append("\n");
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
                        .append(" (").append(translate("Avail:", langChoice)).append(" ")
                        .append(formatMoney(available))
                        .append(")\n");
            }
            sb.append("0. ").append(translate("Back to main menu", langChoice)).append("\n");
            sb.append("5. ").append(translate("Exit", langChoice));
            return con(sb.toString());
        }

        // Get and validate source account index
        String srcIdxStr = state.getStep(3);
        if ("0".equals(srcIdxStr)) {
            return buildMainMenu(member, langChoice);
        }
        if ("5".equals(srcIdxStr)) {
            return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
        }
        int idx;
        try {
            idx = Integer.parseInt(srcIdxStr) - 1;
        } catch (Exception e) {
            return con(translate("Invalid account choice.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        if (idx < 0 || idx >= accounts.size()) {
            return con(translate("Invalid account choice.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        MemberSavingsAccount source = accounts.get(idx);

        // Step 2 inside transfer: enter destination account number (depth 4)
        if (depth == 4) {
            return con(translate("Enter destination account number:", langChoice) + "\n0. " + translate("Back to main menu", langChoice) + "\n5. " + translate("Exit", langChoice));
        }

        // Get and validate destination account
        String destNumber = state.getStep(4);
        if ("0".equals(destNumber)) {
            return buildMainMenu(member, langChoice);
        }
        if ("5".equals(destNumber)) {
            return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
        }
        if (destNumber == null || destNumber.trim().isEmpty()) {
            return con(translate("Destination account number is required.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        destNumber = destNumber.trim().toUpperCase();

        // Validate destination account exists
        Optional<MemberSavingsAccount> destAccountOpt = memberSavingsAccountRepository.findByAccountNumber(destNumber);
        if (destAccountOpt.isEmpty()) {
            // Account doesn't exist - user needs to start transfer again
            return end(translate("Account does not exist. Please check the account number.", langChoice) + "\n" +
                    translate("Press 0 to return to main menu and try again.", langChoice));
        }

        // Step 3 inside transfer: enter amount (depth 5)
        if (depth == 5) {
            return con(translate("Enter amount in ETB:", langChoice) + "\n0. " + translate("Back to main menu", langChoice) + "\n5. " + translate("Exit", langChoice));
        }

        // Get and validate amount
        String amountStr = state.getStep(5);
        if ("0".equals(amountStr)) {
            return buildMainMenu(member, langChoice);
        }
        if ("5".equals(amountStr)) {
            return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
        }
        if (amountStr == null || amountStr.trim().isEmpty()) {
            return con(translate("Invalid amount. Please try again.", langChoice) + "\n" +
                    translate("Enter amount in ETB:", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr.trim());
        } catch (NumberFormatException e) {
            return con(translate("Invalid amount. Enter numbers only.", langChoice) + "\n" +
                    translate("Enter amount in ETB:", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return con(translate("Amount must be positive.", langChoice) + "\n" +
                    translate("Enter amount in ETB:", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }

        BigDecimal balance = source.getBalance() != null ? source.getBalance() : BigDecimal.ZERO;
        BigDecimal locked = source.getLockedAmount() != null ? source.getLockedAmount() : BigDecimal.ZERO;
        BigDecimal available = balance.subtract(locked).max(BigDecimal.ZERO);
        if (available.compareTo(amount) < 0) {
            return con(translate("Insufficient available balance.", langChoice) + "\n" +
                    translate("Enter amount in ETB:", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }

        String sourceNumber = source.getAccountNumber() != null ? source.getAccountNumber() : "SAV-" + String.format("%06d", source.getId());
        if (destNumber.equalsIgnoreCase(sourceNumber)) {
            return con(translate("Cannot transfer to the same account.", langChoice) + "\n" +
                    translate("Enter destination account number:", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }

        TransferRequest tr = new TransferRequest();
        tr.setSourceAccount(source);
        tr.setDestinationAccountNumber(destNumber);
        tr.setAmount(amount);
        tr.setStatus(TransferRequestStatus.PENDING);
        transferRequestRepository.save(tr);

        return end(translate("Transfer request submitted. SACCO will approve and complete it.", langChoice));
    }

    @Transactional
    private String handleApplyLoan(Member member, UssdSessionState state, String langChoice) {
        int depth = state.getDepth();
        
        // Step 1: Ask for loan amount (depth 3)
        if (depth == 3) {
            return con(translate("Enter loan amount in ETB:", langChoice) + "\n0. " + translate("Back to main menu", langChoice) + "\n5. " + translate("Exit", langChoice));
        }

        String amountStr = state.getStep(3);
        if ("0".equals(amountStr)) {
            return buildMainMenu(member, langChoice);
        }
        if ("5".equals(amountStr)) {
            return end(translate("Thank you for using", langChoice) + " " + member.getSacco().getName() + ". " + translate("Goodbye.", langChoice));
        }
        if (amountStr == null || amountStr.trim().isEmpty()) {
            return con(translate("Invalid amount. Please try again.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        BigDecimal requestedAmount;
        try {
            requestedAmount = new BigDecimal(amountStr.trim()).setScale(2, java.math.RoundingMode.UNNECESSARY);
        } catch (NumberFormatException e) {
            return con(translate("Invalid amount. Enter numbers only.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }
        if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return con(translate("Amount must be positive.", langChoice) + "\n0. " + translate("Back to main menu", langChoice));
        }

        BigDecimal eligibleSavings = computeEligibleSavings(member.getId());
        LoanPolicy policy = loanPolicyRepository.findByInstitutionIdAndIsActiveTrue(member.getSacco().getId())
                .orElse(null);
        BigDecimal multiplier = policy != null && policy.getSavingsToLoanMultiplier() != null
                ? policy.getSavingsToLoanMultiplier()
                : BigDecimal.valueOf(3);
        BigDecimal maxLoan = eligibleSavings.multiply(multiplier).setScale(2, java.math.RoundingMode.DOWN);

        if (requestedAmount.compareTo(maxLoan) > 0) {
            return con(translate("Amount exceeds maximum allowed", langChoice) + " (" + formatMoney(maxLoan) + " ETB).\n0. " + translate("Back to main menu", langChoice));
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

        return end(translate("Loan Application Submitted", langChoice));
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

    /**
     * Simple translation method for multi-language support
     * 1 = English, 2 = Amharic, 3 = Oromiffa, 4 = Tigrigna
     */
    private String translate(String key, String langChoice) {
        if ("2".equals(langChoice)) {
            return translateAmharic(key);
        } else if ("3".equals(langChoice)) {
            return translateOromiffa(key);
        } else if ("4".equals(langChoice)) {
            return translateTigrigna(key);
        }
        return key; // Default English
    }

    private String translateAmharic(String key) {
        return switch (key) {
            case "Enter your 4-digit PIN:" -> "4 አሃዝ ፒን ያስገቡ:";
            case "Back" -> "ወደ ኋላ";
            case "Back to main menu" -> "ወደ ዋና ምናሌ";
            case "Phone number not registered. Please visit your SACCO." -> "ስልክ ቁጥር አልተመዘገበም። እባክዎ ሳኮዎን ይጎብኙ።";
            case "Invalid PIN. Please try again." -> "ልክ ያልሆነ ፒን። እባክዎ እንደገና ይሞክሩ።";
            case "Invalid PIN" -> "ልክ ያልሆነ ፒን";
            case "Welcome to" -> "እንኳን ደህና መጡ";
            case "Goodbye." -> "ደህና ይሁኑ።";
            case "Thank you for using" -> "ስለተጠቀሙ እናመሰግናለን";
            case "Savings Balance" -> "የቁጠባ ሂሳብ";
            case "Loan Eligibility" -> "የብድር ብቁነት";
            case "Apply for Loan" -> "ብድር ማመልከቻ";
            case "Transfer Money" -> "ገንዘብ ማስተላለፍ";
            case "Exit" -> "መውጫ";
            case "Invalid option." -> "ልክ ያልሆነ ምርጫ።";
            case "No savings accounts found." -> "ምንም የቁጠባ ሂሳቦች አልተገኙም።";
            case "Savings Summary:" -> "የቁጠባ ማጠቃለያ:";
            case "Balance:" -> "ቀሪ ሂሳብ:";
            case "Locked:" -> "የተቆለፈ:";
            case "Available:" -> "ያለ:";
            case "Minimum savings required:" -> "የሚያስፈልገው ዝቅተኛ ቁጠባ:";
            case "You have" -> "አሎት";
            case "Maximum Loan Allowed:" -> "ከፍተኛው የሚፈቀድ ብድር:";
            case "No active savings accounts found." -> "ምንም ንቁ የቁጠባ ሂሳቦች አልተገኙም።";
            case "Select source account:" -> "የምንጭ ሂሳብ ይምረጡ:";
            case "Avail:" -> "ያለ:";
            case "Invalid account choice." -> "ልክ ያልሆነ የሂሳብ ምርጫ።";
            case "Enter destination account number:" -> "የመድረሻ ሂሳብ ቁጥር ያስገቡ:";
            case "Destination account number is required." -> "የመድረሻ ሂሳብ ቁጥር ያስፈልጋል።";
            case "Account does not exist. Please check the account number." -> "ሂሳቡ የለም። እባክዎ የሂሳብ ቁጥሩን ያረጋግጡ።";
            case "Press 0 to return to main menu and try again." -> "ወደ ዋና ምናሌ ለመመለስ እና እንደገና ለመሞከር 0 ይጫኑ።";
            case "Enter amount in ETB:" -> "መጠን በብር ያስገቡ:";
            case "Invalid amount. Please try again." -> "ልክ ያልሆነ መጠን። እባክዎ እንደገና ይሞክሩ።";
            case "Invalid amount. Enter numbers only." -> "ልክ ያልሆነ መጠን። ቁጥሮችን ብቻ ያስገቡ።";
            case "Amount must be positive." -> "መጠኑ አዎንታዊ መሆን አለበት።";
            case "Insufficient available balance." -> "በቂ ያልሆነ ቀሪ ሂሳብ።";
            case "Cannot transfer to the same account." -> "ወደ ተመሳሳይ ሂሳብ ማስተላለፍ አይቻልም።";
            case "Transfer request submitted. SACCO will approve and complete it." -> "የማስተላለፍ ጥያቄ ገብቷል። ሳኮ ያፀድቃል።";
            case "Enter loan amount in ETB:" -> "የብድር መጠን በብር ያስገቡ:";
            case "Amount exceeds maximum allowed" -> "መጠኑ ከፍተኛውን ይበልጣል";
            case "Loan Application Submitted" -> "የብድር ማመልከቻ ገብቷል";
            default -> key;
        };
    }

    private String translateOromiffa(String key) {
        return switch (key) {
            case "Enter your 4-digit PIN:" -> "Lakkoofsa PIN 4 galchi:";
            case "Back" -> "Duubatti";
            case "Back to main menu" -> "Gara menu guddaatti";
            case "Phone number not registered. Please visit your SACCO." -> "Lakkoofsi bilbilaa hin galmaa'ine. Maaloo SACCO kee daawwadhu.";
            case "Invalid PIN. Please try again." -> "PIN sirrii miti. Maaloo irra deebi'ii yaali.";
            case "Invalid PIN" -> "PIN sirrii miti";
            case "Welcome to" -> "Baga nagaan dhuftan";
            case "Goodbye." -> "Nagaan turii.";
            case "Thank you for using" -> "Fayyadamuu keessaniif galatoomaa";
            case "Savings Balance" -> "Hanqina Qusannaa";
            case "Loan Eligibility" -> "Dandeettii Liqii";
            case "Apply for Loan" -> "Liqii Gaafadhu";
            case "Transfer Money" -> "Maallaqa Dabarsuu";
            case "Exit" -> "Ba'uu";
            case "Invalid option." -> "Filannoo sirrii miti.";
            case "No savings accounts found." -> "Herregni qusannaa hin argamne.";
            case "Savings Summary:" -> "Cuunfaa Qusannaa:";
            case "Balance:" -> "Hanqina:";
            case "Locked:" -> "Cufame:";
            case "Available:" -> "Jiru:";
            case "Minimum savings required:" -> "Qusannaa xiqqaa barbaachisu:";
            case "You have" -> "Qabda";
            case "Maximum Loan Allowed:" -> "Liqii Guddaa Hayyamame:";
            case "No active savings accounts found." -> "Herregni qusannaa socho'aa hin argamne.";
            case "Select source account:" -> "Herreg madda filadhu:";
            case "Avail:" -> "Jiru:";
            case "Invalid account choice." -> "Filannoo herreg sirrii miti.";
            case "Enter destination account number:" -> "Lakkoofsa herreg gara galchi:";
            case "Destination account number is required." -> "Lakkoofsi herreg gara barbaachisaa dha.";
            case "Account does not exist. Please check the account number." -> "Herregni hin jiru. Maaloo lakkoofsa herreg mirkaneessi.";
            case "Press 0 to return to main menu and try again." -> "Gara menu guddaatti deebi'uuf fi irra deebi'ii yaaluuf 0 dhiibi.";
            case "Enter amount in ETB:" -> "Hanga qarshii galchi:";
            case "Invalid amount. Please try again." -> "Hanga sirrii miti. Maaloo irra deebi'ii yaali.";
            case "Invalid amount. Enter numbers only." -> "Hanga sirrii miti. Lakkoofsota qofa galchi.";
            case "Amount must be positive." -> "Hangni gaarii ta'uu qaba.";
            case "Insufficient available balance." -> "Hanqina gahaa hin jiru.";
            case "Cannot transfer to the same account." -> "Gara herreg walfakkaataatti dabarsuu hin danda'amu.";
            case "Transfer request submitted. SACCO will approve and complete it." -> "Gaafannoo dabarsuu dhiyaate. SACCO ni mirkaneessa.";
            case "Enter loan amount in ETB:" -> "Hanga liqii qarshiin galchi:";
            case "Amount exceeds maximum allowed" -> "Hangni guddaa hayyamame caala";
            case "Loan Application Submitted" -> "Gaafannoo Liqii Dhiyaate";
            default -> key;
        };
    }

    private String translateTigrigna(String key) {
        return switch (key) {
            case "Enter your 4-digit PIN:" -> "4 ቁጽሪ ፒን ኣእትው:";
            case "Back" -> "ንድሕሪት";
            case "Back to main menu" -> "ናብ ቀንዲ መናሕሪ";
            case "Phone number not registered. Please visit your SACCO." -> "ቁጽሪ ተሌፎን ኣይተመዝገበን። በጃኹም ናብ ሳኮኹም ምጹ።";
            case "Invalid PIN. Please try again." -> "ዘይቅኑዕ ፒን። በጃኹም ደጊምኩም ፈትኑ።";
            case "Invalid PIN" -> "ዘይቅኑዕ ፒን";
            case "Welcome to" -> "እንቋዕ ብደሓን መጻእኩም";
            case "Goodbye." -> "ብሰላም ኩኑ።";
            case "Thank you for using" -> "ስለ ዝተጠቐምኩም የቐንየልና";
            case "Savings Balance" -> "ቁጠባ ሂሳብ";
            case "Loan Eligibility" -> "ብቕዓት ብድሪ";
            case "Apply for Loan" -> "ብድሪ ምሕታት";
            case "Transfer Money" -> "ገንዘብ ምልኣኽ";
            case "Exit" -> "ምውጻእ";
            case "Invalid option." -> "ዘይቅኑዕ ምርጫ።";
            case "No savings accounts found." -> "ሂሳብ ቁጠባ ኣይተረኽበን።";
            case "Savings Summary:" -> "ጽማቕ ቁጠባ:";
            case "Balance:" -> "ሂሳብ:";
            case "Locked:" -> "ዝተዓጽወ:";
            case "Available:" -> "ዘሎ:";
            case "Minimum savings required:" -> "ዝድለ ዝሓጸረ ቁጠባ:";
            case "You have" -> "ኣሎኩም";
            case "Maximum Loan Allowed:" -> "ዝለዓለ ዝፍቀድ ብድሪ:";
            case "No active savings accounts found." -> "ንጡፍ ሂሳብ ቁጠባ ኣይተረኽበን።";
            case "Select source account:" -> "ምንጪ ሂሳብ ምረጹ:";
            case "Avail:" -> "ዘሎ:";
            case "Invalid account choice." -> "ዘይቅኑዕ ምርጫ ሂሳብ።";
            case "Enter destination account number:" -> "ቁጽሪ መድረሻ ሂሳብ ኣእትው:";
            case "Destination account number is required." -> "ቁጽሪ መድረሻ ሂሳብ የድሊ።";
            case "Account does not exist. Please check the account number." -> "ሂሳብ የለን። በጃኹም ቁጽሪ ሂሳብ ኣረጋግጹ።";
            case "Press 0 to return to main menu and try again." -> "ናብ ቀንዲ መናሕሪ ንምምላስን ደጊምኩም ንምፍታንን 0 ጠውቑ።";
            case "Enter amount in ETB:" -> "መጠን ብብር ኣእትው:";
            case "Invalid amount. Please try again." -> "ዘይቅኑዕ መጠን። በጃኹም ደጊምኩም ፈትኑ።";
            case "Invalid amount. Enter numbers only." -> "ዘይቅኑዕ መጠን። ቁጽርታት ጥራይ ኣእትው።";
            case "Amount must be positive." -> "መጠን ኣወንታዊ ክኸውን ኣለዎ።";
            case "Insufficient available balance." -> "ዘይኣኽል ዘሎ ሂሳብ።";
            case "Cannot transfer to the same account." -> "ናብ ተመሳሳሊ ሂሳብ ምልኣኽ ኣይከኣልን።";
            case "Transfer request submitted. SACCO will approve and complete it." -> "ሕቶ ምልኣኽ ቀሪቡ። ሳኮ ክፈቕድ እዩ።";
            case "Enter loan amount in ETB:" -> "መጠን ብድሪ ብብር ኣእትው:";
            case "Amount exceeds maximum allowed" -> "መጠን ዝለዓለ ዝፍቀድ ይበልጽ";
            case "Loan Application Submitted" -> "ሕቶ ብድሪ ቀሪቡ";
            default -> key;
        };
    }
}
