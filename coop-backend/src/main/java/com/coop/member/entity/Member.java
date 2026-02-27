package com.coop.member.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.institution.entity.Institution;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "members")
@Getter
@Setter
public class Member extends BaseEntity {

    @Column(name = "member_number", nullable = false, unique = true)
    private String memberNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sacco_id", nullable = false)
    private Institution sacco;

    private String region;
    private String woreda;
    private String kebele;

    @Column(name = "house_number")
    private String houseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.ACTIVE;
}
