package com.coop.ussd.controller;

import com.coop.ussd.dto.UssdRequest;
import com.coop.ussd.service.UssdService;
import com.coop.ussd.session.UssdSessionState;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ussd")
@RequiredArgsConstructor
public class UssdController {

    private final UssdService ussdService;

    /**
     * USSD gateway callback (simulator or real gateway).
     * Returns plain text: CON &lt;message&gt; or END &lt;message&gt;.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> handleUssd(@Valid @RequestBody UssdRequest request) {
        UssdSessionState state = UssdSessionState.from(request.getText());
        String response = ussdService.handle(state, request.getPhoneNumber());
        return ResponseEntity.ok(response);
    }
}
