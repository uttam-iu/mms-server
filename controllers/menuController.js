
const { v4: uuid } = require('uuid');
const { getHassPassword, isPasswordMatch, getResponseTemplate, serverFormattedDateAndTime } = require('../helpers/utilities');
// const dbCon = require("../helpers/dbHelper");
// var jwt = require('jsonwebtoken');

exports.menus = async (req, res) => {
    const runningMonthIndex = new Date().getMonth();
    const  menus= [
            { monthId: 'january', monthName: 'January', monthIndex: 0, icon: "Snowflake", colorClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10' },
            { monthId: 'february', monthName: 'February', monthIndex: 1, icon: "Heart", colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
            { monthId: 'march', monthName: 'March', monthIndex: 2, icon: "Sprout", colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
            { monthId: 'april', monthName: 'April', monthIndex: 3, icon: "CloudRain", colorClass: 'text-sky-500', bgClass: 'bg-sky-500/10' },
            { monthId: 'may', monthName: 'May', monthIndex: 4, icon: "Sun", colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
            { monthId: 'june', monthName: 'June', monthIndex: 5, icon: "Flame", colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10' },
            { monthId: 'july', monthName: 'July', monthIndex: 6, icon: "SunMedium", colorClass: 'text-teal-500', bgClass: 'bg-teal-500/10' },
            { monthId: 'august', monthName: 'August', monthIndex: 7, icon: "TreePalm", colorClass: 'text-lime-500', bgClass: 'bg-lime-500/10' },
            { monthId: 'september', monthName: 'September', monthIndex: 8, icon: "Leaf", colorClass: 'text-amber-600', bgClass: 'bg-amber-600/10' },
            { monthId: 'october', monthName: 'October', monthIndex: 9, icon: "Wind", colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
            { monthId: 'november', monthName: 'November', monthIndex: 10, icon: "Coffee", colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10' },
            { monthId: 'december', monthName: 'December', monthIndex: 11, icon: "Gift", colorClass: 'text-red-500', bgClass: 'bg-red-500/10' },
        ]

        const retMenus =[...menus.slice(runningMonthIndex),... menus.slice(0, runningMonthIndex) ]?.map((menu, index) => {
            return {
                ...menu,
                isCurrentMonth: menu?.monthIndex === runningMonthIndex,
                order: index + 1
            }
        })
    return getResponseTemplate(res, 200, retMenus, "success");
   
};