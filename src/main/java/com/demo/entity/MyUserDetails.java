package com.demo.entity;

import java.util.List;

public class MyUserDetails extends SysUser{
    private List<UserRole> roleList;

    public MyUserDetails(SysUser user, List<UserRole> roles){
        super(user);
        this.roleList = roles;
    }

    public String getAuthorities() {
        if(roleList == null || roleList.size() < 1){
            return "";
        }
        StringBuilder builder = new StringBuilder();
        for(UserRole role: roleList){
            builder.append(role.getRole()).append(",");
        }
        String authorities = builder.substring(0, builder.length() -1);
        return authorities;
    }
}
