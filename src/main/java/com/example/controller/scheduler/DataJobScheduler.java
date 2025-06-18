package com.example.controller.scheduler;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

public class DataJobScheduler {
    public void scheduleJob() throws SchedulerException {
		/* 서버에서만 돌게끔 로컬은 막음 
		 * Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
		 * scheduler.start();
		 * 
		 * JobKey jobKey = new JobKey("airJob", "group1");
		 * 
		 * if (!scheduler.checkExists(jobKey)) { JobDetail job =
		 * JobBuilder.newJob(DataJob.class) .withIdentity(jobKey) .build();
		 * 
		 * Trigger trigger = TriggerBuilder.newTrigger() .withIdentity("hourlyTrigger",
		 * "group1") .withSchedule(CronScheduleBuilder.cronSchedule("0 30 * * * ?"))
		 * .build();
		 * 
		 * scheduler.scheduleJob(job, trigger); }
		 */
    }
}
