import {Component} from '@angular/core';
import { faCheck, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {TimeCalculatorService} from "../services/time-calculator.service";

export interface Holiday {
    date: Date,
    recurring: boolean

}
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    startWorkday: Date;
    endWorkday: Date;
    startDate: Date;
    currentHoliday: Date;
    isRecurring: boolean;
    holidays: Array<Holiday>;
    faCheck = faCheck;
    faTrashCan = faTrashCan;
    holidayExists: boolean = false;
    additionalTime: number;
    calculatedDate: Date;

    constructor(private timeCalculatorService: TimeCalculatorService) {
        this.holidays = [];
    }

    addHoliday(){
        const newHoliday = {
            date: this.currentHoliday,
            recurring: this.isRecurring
        };
        if(!(this.holidays.some(h => h.date == this.currentHoliday && h.recurring == this.isRecurring))) {
            this.holidayExists = false;
            this.holidays.push({
                date: this.currentHoliday,
                recurring: this.isRecurring
            })
        } else {
            this.holidayExists = true;

        }
    }
    deleteHoliday(index: number){
        this.holidays.splice(index, 1)
    }

    calculateDate(){
        this.calculatedDate = this.timeCalculatorService.calculateNewDate({ startDate: this.startDate, startTime: this.startWorkday, endTime: this.endWorkday, holidayDates: this.holidays}, this.additionalTime)

    }
}

