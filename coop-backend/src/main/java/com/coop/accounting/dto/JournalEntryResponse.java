package com.coop.accounting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryResponse {

    private Long id;
    private Long institutionId;
    private String referenceType;
    private Long referenceId;
    private LocalDate entryDate;
    private String description;
    private List<JournalLineDto> lines;
}
