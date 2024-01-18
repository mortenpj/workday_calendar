import {Injectable} from '@angular/core';
import {CalculateObject} from "./calculateObject";
import {DateTime, Duration} from "luxon";
import {Holiday} from "../app/app.component";

@Injectable({
    providedIn: 'root'
})
export class TimeCalculatorService {

    holidayDates: Array<Holiday>;
    calculateDate: Date;
    constructor() {
    }

    calculateNewDate(calculateObject: CalculateObject, additionalTime: number) {
        this.holidayDates = calculateObject.holidayDates;
        const workHoursInMinutes = this.calculateWorkHoursInMinutes(calculateObject.startTime, calculateObject.endTime);
        if(additionalTime > 0){
            this.calculateDate = this.addDaysToStartDate(calculateObject.startDate, additionalTime).toJSDate();
            const additionalMinutes = this.calclateAdditionalMinutes(workHoursInMinutes, additionalTime);
            this.calculateDate = this.addTimeToCalculatedDate(calculateObject.startTime, calculateObject.endTime, additionalMinutes).toJSDate();
        } else if(additionalTime < 0){
            this.calculateDate = this.substractDaysFromStartDate(calculateObject.startDate, additionalTime).toJSDate();
            const substractingMinutes = this.calculateSubstractingMinutes(workHoursInMinutes, additionalTime);
            this.calculateDate = this.substractTimeFromCalculateDate(calculateObject.startTime, calculateObject.endTime, substractingMinutes).toJSDate();
        }
        return this.calculateDate;
    }

    calculateWorkHoursInMinutes(startTime: Date, endTime: Date){
        const end = DateTime.fromJSDate(endTime).set({ second: 0});
        const start = DateTime.fromJSDate(startTime).set({ second: 0});
        const duration = end.diff(start, ['hours', 'minutes']).toObject();
        return Duration.fromObject({ hours: duration.hours, minutes: duration.minutes}).as('minutes');
    }

    addDaysToStartDate(startDate: Date, additionalTime: number){
        let startDateTime = DateTime.fromJSDate(startDate);
        let completeDays = Math.trunc(additionalTime);
        if(completeDays != 0) {
            while (completeDays > 0) {
                startDateTime = startDateTime.plus({day: 1});
                if (!this.dateIsWeekend(startDateTime) && !this.dateIsHoliday(startDateTime)) {
                    completeDays--;
                }
            }
        } else if(completeDays == 0) {
            if(this.dateIsWeekend(startDateTime) || this.dateIsHoliday(startDateTime)){
                startDateTime = this.getNextWorkDay(startDateTime)
            }
        }
        return startDateTime;
    }

    dateIsWeekend(date: DateTime): boolean {
        return date.isWeekend;
    }

    dateIsHoliday(date: DateTime): boolean {
        const recurringHoliday = this.holidayDates.filter(h => h.date.getMonth() + 1 == date.month && h.date.getDate() == date.day && h.recurring).at(0);
        const oneTimeHoliday = this.holidayDates.filter(h => h.date.getMonth() + 1 == date.month && h.date.getDate() == date.day && h.date.getFullYear() == date.year).at(0)
        return recurringHoliday !== undefined || oneTimeHoliday !== undefined;
    }

    calclateAdditionalMinutes(workHoursInMinutes: number, additionalTime: number){
        const fullDays = Math.trunc(additionalTime);
        const minuteFraction = additionalTime - fullDays;
        return workHoursInMinutes * minuteFraction;
    }

    addTimeToCalculatedDate(startTime: Date, endTime: Date, additionalMinutes: number){
        let calculatedDateTime = DateTime.fromJSDate(this.calculateDate);
        const startDateTime = DateTime.fromFormat(`${calculatedDateTime.year}.${calculatedDateTime.month}.${calculatedDateTime.day}-${startTime.getHours()}:${startTime.getMinutes()}`, 'yyyy.M.d-H:m')
        const endDateTime = DateTime.fromFormat(`${calculatedDateTime.year}.${calculatedDateTime.month}.${calculatedDateTime.day}-${endTime.getHours()}:${endTime.getMinutes()}`, 'yyyy.M.d-H:m')
        //Time is before set start of working time, need to set it to begining
        if(calculatedDateTime < startDateTime){
            calculatedDateTime = calculatedDateTime.set({ hour: startTime.getHours(), minute: startTime.getMinutes()});
        } else if(calculatedDateTime > endDateTime){
            //Time is set after end of work time, so need to go to next work day, as time will start at the begining of next workday
            calculatedDateTime = this.getNextWorkDay(calculatedDateTime)
            calculatedDateTime = calculatedDateTime.set({ hour: startDateTime.hour, minute: startDateTime.minute})
        } else if(calculatedDateTime > startDateTime && calculatedDateTime < endDateTime){
            //Startdate time is inside of set workhours
            const duration = endDateTime.diff(calculatedDateTime, ['hours', 'minutes']).toObject();
            const minutesUntilEndOfWorkDay = Duration.fromObject({ hours: duration.hours, minutes: duration.minutes}).as('minutes');
            //Need to go to next workday because we need to add more time then whats left of the workday
            if(additionalMinutes > minutesUntilEndOfWorkDay){
                additionalMinutes = additionalMinutes - minutesUntilEndOfWorkDay;
                calculatedDateTime = this.getNextWorkDay(calculatedDateTime);
                calculatedDateTime = calculatedDateTime.set({ hour: startDateTime.hour, minute: startDateTime.minute});
            }
        }
        return calculatedDateTime.plus({ minute: additionalMinutes});

    }

    getNextWorkDay(calculatedDateTime: DateTime) {
        let validWorkday = false;
        while (!validWorkday) {
            calculatedDateTime = calculatedDateTime.plus({day: 1});
            if (!this.dateIsHoliday(calculatedDateTime) && !this.dateIsHoliday(calculatedDateTime)) {
                validWorkday = true;
            }
        }
        return calculatedDateTime;
    }

    substractDaysFromStartDate(startDate: Date, substractTime: number){
        let startDateTime = DateTime.fromJSDate(startDate);
        let completeDays = Math.trunc(substractTime);
        while(completeDays < 0){
            startDateTime = startDateTime.plus({ day: -1});
            if(!this.dateIsWeekend(startDateTime) && !this.dateIsHoliday(startDateTime)){
                completeDays++;
            }
        }
        return startDateTime;
    }

    calculateSubstractingMinutes(workHoursInMinutes: number, substractingTime: number){
        const fullDays = Math.trunc(substractingTime);
        const minuteFraction = (substractingTime + fullDays)*-1;
        return workHoursInMinutes * minuteFraction;
    }

    substractTimeFromCalculateDate(startTime: Date, endTime: Date, substractingMinutes: number){
        let calculatedDateTime = DateTime.fromJSDate(this.calculateDate);
        const startDateTime = DateTime.fromFormat(`${calculatedDateTime.year}.${calculatedDateTime.month}.${calculatedDateTime.day}-${startTime.getHours()}:${startTime.getMinutes()}`, 'yyyy.M.d-H:m')
        const endDateTime = DateTime.fromFormat(`${calculatedDateTime.year}.${calculatedDateTime.month}.${calculatedDateTime.day}-${endTime.getHours()}:${endTime.getMinutes()}`, 'yyyy.M.d-H:m')

        //calculated date and time is 1 day ahead, need to go back 1 day and to end of workday
        if(calculatedDateTime.hour > 0 && calculatedDateTime < startDateTime){
            calculatedDateTime = this.getPreviousWorkDay(calculatedDateTime)
            calculatedDateTime = calculatedDateTime.set({ hour: endDateTime.hour, minute: endDateTime.minute})
        } else if(calculatedDateTime.hour < 23 && calculatedDateTime > endDateTime){
            //Calculated date and time is before midnight and after end of workday
            calculatedDateTime = calculatedDateTime.set({ hour: endDateTime.hour, minute: endDateTime.minute})
        } else if(calculatedDateTime < endDateTime && calculatedDateTime > startDateTime){
            //calculated date is inside of workhours
            const duration = startDateTime.diff(calculatedDateTime, ['hours', 'minutes']).toObject();
            const minutesUntilBeginingOfWorkDay = Duration.fromObject({ hours: duration.hours, minutes: duration.minutes}).as('minutes');
            //Need to go to previous workday because we need to substract more time after reaching start of workday
            if(substractingMinutes > minutesUntilBeginingOfWorkDay){
                substractingMinutes = substractingMinutes - minutesUntilBeginingOfWorkDay;
                calculatedDateTime = this.getPreviousWorkDay(calculatedDateTime);
                calculatedDateTime = calculatedDateTime.set({ hour: endDateTime.hour, minute: endDateTime.minute});
            }
        }
        return calculatedDateTime.plus({ minute: -substractingMinutes});
    }

    getPreviousWorkDay(calculatedDateTime: DateTime) {
        let validWorkday = false;
        while (!validWorkday) {
            calculatedDateTime = calculatedDateTime.plus({day: -1});
            if (!this.dateIsWeekend(calculatedDateTime) && !this.dateIsHoliday(calculatedDateTime)) {
                validWorkday = true;
            }
        }
        return calculatedDateTime;
    }
}
