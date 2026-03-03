package com.coop.contact.service;

import com.coop.contact.dto.ContactMessageRequest;
import com.coop.contact.dto.ContactMessageResponse;
import com.coop.contact.entity.ContactMessage;
import com.coop.contact.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageResponse create(ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName().trim());
        message.setEmail(request.getEmail().trim().toLowerCase());
        message.setMessage(request.getMessage().trim());
        return ContactMessageResponse.from(contactMessageRepository.save(message));
    }

    public List<ContactMessageResponse> listAll() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ContactMessageResponse::from)
                .collect(Collectors.toList());
    }
}
