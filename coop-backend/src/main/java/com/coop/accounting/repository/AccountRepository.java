package com.coop.accounting.repository;

import com.coop.accounting.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByInstitutionId(Long institutionId);
}
