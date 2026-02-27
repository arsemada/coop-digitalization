package com.coop.accounting.repository;

import com.coop.accounting.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByInstitutionIdAndEntryDateBetweenOrderByEntryDateAsc(Long institutionId, LocalDate start, LocalDate end);
}
