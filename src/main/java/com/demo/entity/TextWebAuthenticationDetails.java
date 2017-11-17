package com.demo.entity;

import org.springframework.security.web.authentication.WebAuthenticationDetails;

import javax.servlet.http.HttpServletRequest;

public class TextWebAuthenticationDetails extends WebAuthenticationDetails {
    private String text;
    private String comparator;

    public String getComparator() {
        return comparator;
    }

    public TextWebAuthenticationDetails(HttpServletRequest request) {
        super(request);
        String text = request.getParameter("position");
        String comparator = (String)request.getSession().getAttribute("gap");
        this.comparator = comparator;
        this.text = text;
    }

    public String getText() {
        return text;
    }
}
