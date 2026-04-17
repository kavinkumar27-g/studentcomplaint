package com.example.demo.service;

import org.springframework.stereotype.Service;

/**
 * EmailService - Handles email notifications to students.
 * 
 * Currently configured as a MOCK email service that prints to the console.
 * This lets the system run without a real email server during development.
 * 
 * To enable real emails:
 *  1. Remove the autoconfigure.exclude line in application.properties
 *  2. Add your SMTP credentials to application.properties
 *  3. Inject JavaMailSender and uncomment the real email code below
 */
@Service
public class EmailService {

    /**
     * Simulates sending an email by printing to console.
     * Replace this method body with real JavaMailSender code when ready.
     *
     * @param to      recipient email address
     * @param subject email subject line
     * @param text    email body content
     */
    public void sendEmail(String to, String subject, String text) {
        // Console mock — prints instead of sending real email
        System.out.println("\n======================================");
        System.out.println("📧 MOCK EMAIL NOTIFICATION");
        System.out.println("======================================");
        System.out.println("To:      " + to);
        System.out.println("Subject: " + subject);
        System.out.println("--------------------------------------");
        System.out.println(text);
        System.out.println("======================================\n");

        /* --- REAL EMAIL CODE (uncomment when SMTP is configured) ---
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@complainease.edu");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        
        try {
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (MailException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
        */
    }
}
