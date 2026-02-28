package com.coop.member.repository;

import com.coop.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByMemberNumber(String memberNumber);

    List<Member> findBySaccoId(Long saccoId);

    boolean existsByMemberNumberAndSaccoId(String memberNumber, Long saccoId);

    boolean existsBySaccoIdAndEmail(Long saccoId, String email);
}
