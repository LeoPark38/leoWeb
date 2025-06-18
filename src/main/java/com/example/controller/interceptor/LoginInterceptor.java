package com.example.controller.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;

public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        HttpSession session = request.getSession(false);
        
        // 로그인 세션이 없으면 로그인 페이지로 리디렉션
        if (session == null || session.getAttribute("userInfo") == null) {
        	//System.out.println("##### session is null : "+request.getContextPath());
        	
            response.sendRedirect(request.getContextPath() + "/views/logInPage.html");
            return false;
        }else {
        	//System.out.println("##### session.getAttribute(userInfo) : "+session.getAttribute("userInfo"));
        	//System.out.println("##### session is not null : "+request.getContextPath());
        }

        return true;
    }
}
