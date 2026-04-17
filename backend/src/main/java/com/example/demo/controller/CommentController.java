package com.example.demo.controller;

import com.example.demo.model.Comment;
import com.example.demo.model.Complaint;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserDetailsImpl;
import com.example.demo.service.CommentService;
import com.example.demo.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private ComplaintService complaintService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{complaintId}")
    public ResponseEntity<?> addComment(
            @PathVariable Long complaintId,
            @RequestBody CommentRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Complaint complaint = complaintService.getComplaintById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Comment comment = new Comment();
        comment.setMessage(request.getMessage());
        comment.setUser(user);
        comment.setComplaint(complaint);

        Comment savedComment = commentService.addComment(comment);
        return ResponseEntity.ok(savedComment);
    }

    @GetMapping("/{complaintId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long complaintId) {
        return ResponseEntity.ok(commentService.getCommentsByComplaint(complaintId));
    }
    
    public static class CommentRequest {
        private String message;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
