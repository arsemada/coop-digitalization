package com.coop.contact.controller;

import com.coop.common.response.ApiResponse;
import com.coop.contact.dto.ContactMessageRequest;
import com.coop.contact.dto.ContactMessageResponse;
import com.coop.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /** Public: Anyone can submit a contact message from the landing page */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ContactMessageResponse> submit(@Valid @RequestBody ContactMessageRequest request) {
        return ApiResponse.success(contactService.create(request));
    }

    /** Super admin only: List all contact messages */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<ContactMessageResponse>> list() {
        return ApiResponse.success(contactService.listAll());
    }
}
