package com.example.controller.scheduler;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.quartz.SchedulerException;

public class AppInitListener implements ServletContextListener {
    public void contextInitialized(ServletContextEvent sce) {
        try {
            new DataJobScheduler().scheduleJob();
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
    }

    public void contextDestroyed(ServletContextEvent sce) {}
}

