package com.example.demo.service;

import com.example.demo.model.Complaint;
import com.example.demo.model.ComplaintStatus;
import com.example.demo.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * ComplaintService contains all the business logic for complaint operations.
 * It acts as an intermediary between the controller and the database (repository).
 */
@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Save a new complaint to the database.
     * Status defaults to PENDING automatically (set in the entity).
     */
    public Complaint createComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    /**
     * Retrieve all complaints, ordered by creation date (newest first).
     * Used by Admin role.
     */
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Retrieve complaints for a specific student by their user ID.
     * Used by Student role to see only their own complaints.
     */
    public List<Complaint> getComplaintsByUser(Long userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Find a specific complaint by its database ID.
     * Returns Optional to safely handle "not found" cases.
     */
    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    /**
     * Update the status of a complaint and send an email notification to the student.
     * Status values: PENDING, IN_PROGRESS, RESOLVED
     */
    public Complaint updateComplaintStatus(Long id, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(status);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Send email notification only when the status actually changes
        if (oldStatus != status) {
            emailService.sendEmail(
                complaint.getUser().getEmail(),
                "Status Update on Your Complaint: " + complaint.getTitle(),
                "Dear " + complaint.getUser().getName() + ",\n\n" +
                "Your complaint titled \"" + complaint.getTitle() + "\" status has been updated.\n" +
                "Previous Status: " + oldStatus + "\n" +
                "New Status: " + status + "\n\n" +
                "Thank you for using the Student Complaint Portal."
            );
        }

        return savedComplaint;
    }

    /**
     * Permanently delete a complaint by its ID.
     * Used by Admin role.
     */
    public void deleteComplaint(Long id) {
        if (!complaintRepository.existsById(id)) {
            throw new RuntimeException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
    }
}
