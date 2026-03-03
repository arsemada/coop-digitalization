package com.coop.accounting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryResponse {

    private Long id;
    private Long institutionId;
    private String referenceNumber;
    private String referenceType;
    private Long referenceId;
    private LocalDate entryDate;
    private String description;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private List<JournalLineDto> lines;
}
