package com.demo.entity;

public class CustomWebAuthenticationDetails{
    private String imageCode;
    private String session_imageCode;
    private long session_imageTime;

    public CustomWebAuthenticationDetails(String imageCode, String session_imageCode, String session_imageTime) {
        this.imageCode = imageCode;
        this.session_imageCode = session_imageCode;
        String session_verifyTime = session_imageTime;
        if(session_verifyTime == null){
            this.session_imageTime = 0L;
        }else {
            this.session_imageTime = Long.parseLong(session_verifyTime);
        }
    }

    public String getImageCode() {
        return imageCode;
    }

    public String getSession_imageCode() {
        return session_imageCode;
    }

    public long getSession_imageTime() {
        return session_imageTime;
    }
}
