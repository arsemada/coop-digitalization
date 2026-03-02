package com.coop.contact.dto;

import com.coop.contact.entity.ContactMessage;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ContactMessageResponse {

    private Long id;
    private String name;
    private String email;
    private String message;
    private Instant createdAt;

    public static ContactMessageResponse from(ContactMessage entity) {
        return ContactMessageResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
