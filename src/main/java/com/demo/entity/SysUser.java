package com.demo.entity;

public class SysUser {
    private int id;
    private String username;
    private String password;

    public SysUser(){}

    public SysUser(SysUser user){
        this.id = user.getId();
        this.password = user.getPassword();
        this.username = user.getUsername();
    }
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
