package com.coop.accounting.repository;

import com.coop.accounting.entity.JournalLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalLineRepository extends JpaRepository<JournalLine, Long> {

    List<JournalLine> findByJournalEntryId(Long journalEntryId);
}
