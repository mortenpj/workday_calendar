import {Holiday} from "../app/app.component";

export interface CalculateObject {
    startDate: Date;
    startTime: Date;
    endTime: Date;
    holidayDates: Array<Holiday>;
}
