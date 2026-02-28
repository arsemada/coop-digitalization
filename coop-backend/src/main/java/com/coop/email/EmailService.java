package com.coop.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    /** Sends OTP to the given email. Fails silently if mail is not configured. */
    public void sendOtp(String to, String username, String otp, String subjectPrefix) {
        if (to == null || to.isBlank()) return;
        if (mailSender == null) {
            log.debug("Mail not configured, skipping OTP email to {}", to);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from != null && !from.isBlank() ? from : "noreply@coopdigital.org");
            msg.setTo(to.trim());
            msg.setSubject((subjectPrefix != null ? subjectPrefix + " - " : "") + "Your Login OTP");
            msg.setText(String.format(
                "Hello,\n\nYour login credentials:\nUsername: %s\nOTP: %s\n\nPlease log in and change your password.\n\n— CoopDigital",
                username, otp));
            mailSender.send(msg);
            log.info("OTP email sent to {}", to);
        } catch (Exception e) {
            log.warn("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }
}
