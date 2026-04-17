package com.example.demo.controller;

import com.example.demo.model.Complaint;
import com.example.demo.model.ComplaintCategory;
import com.example.demo.model.ComplaintStatus;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserDetailsImpl;
import com.example.demo.service.ComplaintService;
import com.example.demo.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * ComplaintController handles all REST API endpoints for complaints.
 * BASE URL: /api/complaints
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/complaints
     * Creates a new complaint. Available to STUDENT and ADMIN roles.
     * Supports optional file upload.
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        // Get the currently logged-in user from Spring Security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build the complaint object
        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setCategory(ComplaintCategory.valueOf(category.toUpperCase()));
        complaint.setUser(user);

        // Handle optional file attachment
        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            complaint.setImageUrl(fileName);
        }

        Complaint savedComplaint = complaintService.createComplaint(complaint);
        return ResponseEntity.ok(savedComplaint);
    }

    /**
     * GET /api/complaints
     * Admin/Staff see ALL complaints. Student sees only their own.
     */
    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<Complaint>> getComplaints() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Admin and Staff can see all complaints; students see only their own
        if (user.getRole().name().equals("ADMIN") || user.getRole().name().equals("STAFF")) {
            return ResponseEntity.ok(complaintService.getAllComplaints());
        } else {
            return ResponseEntity.ok(complaintService.getComplaintsByUser(user.getId()));
        }
    }

    /**
     * GET /api/complaints/my
     * Convenience endpoint for students to get only their own complaints.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getMyComplaints() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.getComplaintsByUser(userDetails.getId()));
    }

    /**
     * GET /api/complaints/{id}
     * Returns a single complaint by its ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        Complaint complaint = complaintService.getComplaintById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        return ResponseEntity.ok(complaint);
    }

    /**
     * PUT /api/complaints/{id}/status
     * Admin only: update the status of a complaint (PENDING → IN_PROGRESS → RESOLVED).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {

        ComplaintStatus newStatus = ComplaintStatus.valueOf(request.getStatus().toUpperCase());
        Complaint updatedComplaint = complaintService.updateComplaintStatus(id, newStatus);
        return ResponseEntity.ok(updatedComplaint);
    }

    /**
     * DELETE /api/complaints/{id}
     * Admin only: permanently deletes a complaint.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
            put("message", "Complaint deleted successfully");
        }});
    }

    /**
     * Inner DTO class for the status update request body.
     * Example JSON: { "status": "IN_PROGRESS" }
     */
    public static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
