package com.coop.accounting.repository;

import com.coop.accounting.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByInstitutionId(Long institutionId);

    Optional<Account> findByInstitutionIdAndCode(Long institutionId, String code);
}
