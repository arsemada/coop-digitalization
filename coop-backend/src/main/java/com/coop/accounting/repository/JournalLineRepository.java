package com.coop.accounting.repository;

import com.coop.accounting.entity.JournalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface JournalLineRepository extends JpaRepository<JournalLine, Long> {

    List<JournalLine> findByJournalEntryId(Long journalEntryId);

    List<JournalLine> findByJournalEntryIdIn(Collection<Long> journalEntryIds);

    @Query("SELECT jl FROM JournalLine jl WHERE jl.memberId = :memberId AND jl.journalEntry.institution.id = :institutionId AND jl.journalEntry.entryDate BETWEEN :start AND :end ORDER BY jl.journalEntry.entryDate ASC, jl.journalEntry.id ASC, jl.id ASC")
    List<JournalLine> findByMemberIdAndInstitutionAndDateRange(@Param("memberId") Long memberId, @Param("institutionId") Long institutionId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT jl FROM JournalLine jl WHERE jl.account.id = :accountId AND jl.journalEntry.institution.id = :institutionId AND jl.journalEntry.entryDate BETWEEN :start AND :end ORDER BY jl.journalEntry.entryDate ASC, jl.journalEntry.id ASC, jl.id ASC")
    List<JournalLine> findByAccountAndInstitutionAndDateRange(@Param("accountId") Long accountId, @Param("institutionId") Long institutionId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT jl FROM JournalLine jl WHERE jl.journalEntry.institution.id = :institutionId AND jl.journalEntry.entryDate BETWEEN :start AND :end ORDER BY jl.journalEntry.entryDate ASC")
    List<JournalLine> findByInstitutionAndDateRange(@Param("institutionId") Long institutionId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
