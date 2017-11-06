package com.demo.mapper;

import com.demo.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SysUserMapper {
    @Select("select username,password,id from user where username=#{name}")
    List<SysUser> select(@Param("name") String username);
}
