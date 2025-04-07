import fetch from "node-fetch"
import * as cheerio from 'cheerio';
import { parse, startOfDay } from 'date-fns';
import iconv from "iconv-lite";
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config() ;

var mealData = []

const botToken = process.env.BOT_TOKEN ;
const bot = new Telegraf(botToken) ;

const chatIdArray = process.env.CHAT_IDS.split(',') ;

const sendMessage = async (message) => {
    for(const id of chatIdArray)
        await bot.telegram.sendMessage(Number(id), message);
    
    console.log('Message sent');
  };

const url = "https://kafemud.bilkent.edu.tr/monu_eng.html" ;

const response = await fetch(url);
const buffer = await response.arrayBuffer();
const data = iconv.decode(Buffer.from(buffer), "windows-1254"); // Decode using Windows-1254

//console.log(data) ;

const $ = cheerio.load(data) ;
const pTags = $('td[rowspan="12"] p') ;

pTags.each((index, element) => {
    const date = $(element).text().split('\n')[0];
    //console.log(date);
    var lunch = ""
    var dinner = ""
    const daysMeal = [] ;
    const meal = {}
    
    const lunchTags = $(element).parent().parent().nextAll('tr').slice(0, 5);
    lunchTags.each((i, trElement) => {
        lunch += $(trElement).children().first().text().trim() + "\n";
    })

    const dinnerTags = $(element).parent().parent().nextAll('tr').slice(6, 11);
    dinnerTags.each((i, trElement) => {
        dinner += $(trElement).children().first().text().trim() + "\n";
    })

    daysMeal.push(lunch);
    daysMeal.push(dinner);

    meal["date"] = date;
    meal["meal"] = daysMeal;


    mealData.push(meal) ;
})

mealData = mealData.slice(0,mealData.length / 2) ;
var todayMeal;

mealData.forEach((meal, index) => {
    const parsedDate = parse(meal["date"], 'dd.MM.yyyy', new Date()) ;

    const today = startOfDay(new Date())
    const parsedDay = startOfDay(parsedDate)

    if(parsedDay.getTime() === today.getTime()){
        todayMeal = meal;
    }
})

console.log(todayMeal["meal"][0]);

sendMessage("Today's Lunch is: \n\n" + todayMeal["meal"][0]) ;






 

