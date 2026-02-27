package com.coop.savings.repository;

import com.coop.savings.entity.MemberSavingsAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberSavingsAccountRepository extends JpaRepository<MemberSavingsAccount, Long> {

    List<MemberSavingsAccount> findByMemberId(Long memberId);

    Optional<MemberSavingsAccount> findByMemberIdAndSavingsProductId(Long memberId, Long savingsProductId);
}
