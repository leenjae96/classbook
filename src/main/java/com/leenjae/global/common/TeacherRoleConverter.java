package com.leenjae.global.common;

import com.leenjae.domain.TeacherRoles;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TeacherRoleConverter implements AttributeConverter<TeacherRoles, Integer> {

    @Override
    public Integer convertToDatabaseColumn(TeacherRoles attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getCode();
    }

    @Override
    public TeacherRoles convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return null;
        }
        return TeacherRoles.of(dbData);
    }

}
