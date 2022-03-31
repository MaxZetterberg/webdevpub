    export class Clock {
    constructor(hour,minute) {
        (hour >= 0 && hour < 24) ? this._hour = hour : console.log("Value must be between 0 and 24");
        (minute >= 0 && minute < 60) ? this._minute = minute : console.log("Value must be between 0 and 60");
        this.alarmIsActive = true;
        this.alarmIsTrigger = false;
        this.setAlarm(14, 0);
    }

    setAlarm(hour,minute) {
        this._hourAlarm = hour;
        this._minuteAlarm = minute;
    }

    set alarmFromString(string){
        this._hourAlarm = string.split(":")[0]
        this._minuteAlarm = string.split(":")[1]
        this.alarmIstrigger = false;
    }

    get alarmFromString(){
        return this.alarmTime;
    }

    activateAlarm() {
        this.alarmIsActive = true;
    }
    deactivateAlarm() {
        this.alarmIsActive = false;
    }

    toggleAlarm(){
        this.alarmIsTrigger = false;
    }



    get time(){
        return {"hour": this._hour.toString().padStart(2, "0"),
        "minute": this._minute.toString().padStart(2, "0")
        }
    }

    get alarmTime(){
        return this._hourAlarm.toString().padStart(2, '0') + ":" + this._minuteAlarm.toString().padStart(2, '0');
    }




    

    tick(){
        this._minute += 1;
        if(this._minute >= 60){
            this._minute = 0;
            this._hour += 1;
        }

        if(this._hour >= 24){
            this._hour = 0;
        }

        let timeHour = (this._hour < 10) ? "0" + this._hour : this._hour;
        let timeMinute = (this._minute < 10) ? "0" + this._minute : this._minute;
        console.log(timeHour + ":" + timeMinute);
        if(this.alarmIsActive && this._hour == this._hourAlarm && this._minute == this._minuteAlarm){
            console.log("Alarm!!!");
            this.alarmIsTrigger = true;
        }
    }



}

