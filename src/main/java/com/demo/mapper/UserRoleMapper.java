package com.demo.mapper;

import com.demo.entity.SysUser;
import com.demo.entity.UserRole;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface UserRoleMapper {
    @Select("select role,userid from user_role where userid=#{user.id}")
    List<UserRole> getRolesByUser(@Param("user")SysUser user);
}
