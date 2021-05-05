const formSearch = document.querySelector('.form-search'),
   inputCitiesFrom = document.querySelector('.input__cities-from'),
   dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
   inputCitiesTo = document.querySelector('.input__cities-to'),
   dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
   inputDateDepart = document.querySelector('.input__date-depart'),
   cheapestTicket = document.getElementById('cheapest-ticket'),
   otherCheapTickets = document.getElementById('other-cheap-tickets')

//database / cities.json
// http://api.travelpayouts.com/data/ru/cities.json
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
   proxy = 'https://cors-anywhere.herokuapp.com/',
   // API_KEY = 'c4f7a3d6f2e2625e6e926b66a94eea76',
   calendar = 'http://min-prices.aviasales.ru/calendar_preload',
   MAX_COUNT = 10;


let city = [];
let date;
// const showCity = (input, list) => {
//    list.textContent = '';

//    if (input.value !== '') {

//       const filterCity = city.filter((item) => {
//          const fixItem = item.toLowerCase();
//          return fixItem.includes(input.value.toLowerCase())
//       })
//       filterCity.forEach((item) => {
//          const li = document.createElement('li');
//          li.classList.add('​dropdown__city');
//          li.textContent = item;
//          list.append(li)
//       })
//    }
// }

// inputCitiesFrom.addEventListener('input', () => {
//    showCity(inputCitiesFrom, dropdownCitiesFrom)
// })

// dropdownCitiesFrom.addEventListener('click', (e) => {
//    const target = e.target

//    if (target.tagName.toLowerCase() === 'li') {
//       inputCitiesFrom.value = target.textContent;
//       dropdownCitiesFrom.textContent = ''
//    }
// })


// FUNCTION
const getData = (url, callback) => {
   const request = new XMLHttpRequest();
   request.open('GET', url);
   request.addEventListener('readystatechange', () => {
      if (request.readyState !== 4) return;
      if (request.status === 200) {
         callback(request.response)
      } else {
         console.error(request.status)
      }
   })
   request.send();
}

const showCity = (input, ul) => {
   ul.textContent = ''
   const filterCity = city.filter(city => {
      if (city.name) {
         const cityLower = city.name.toLowerCase()
         return cityLower.startsWith(input.value.toLowerCase())
      }
   })
   // .sort((firstObj, secondObj) => firstObj.name > secondObj.name ? 1 : -1)
   filterCity.forEach(cityName => {
      if (input.value !== '') {
         let li = document.createElement('li')
         li.classList.add('dropdown__city')
         li.textContent = cityName.name
         ul.append(li)
      }
   })
}
const getNameCity = (cityCodeName) => {
   const cityCode = city.find(city => city.code === cityCodeName)
   if (cityCode) {
      return `${cityCode.name}`

   } else {
      return `У города нет кода`
   }
}
const normalCalendarDate = (date) => {
   return new Date(date).toLocaleString('ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   })
}


const getChanges = (changes) => {
   if (changes > 0) {
      return `Пересадок: ${changes}`
   } else {
      return `Без пересадок`
   }
}

const createCard = (data) => {
   const ticket = document.createElement('article')
   ticket.classList.add('ticket')
   let deep = '';
   if (data) {
      deep = `
      <h3 class="agent">${data.gate}</h3>
         <div class="ticket__wrapper">
            <div class="left-side">
               <a href="${getLinkAviaSales(data)}" class="button button__buy">Купить
                  за ${data.value}₽</a>
            </div>
            <div class="right-side">
               <div class="block-left">
                  <div class="city__from">Вылет из города:
                     <span class="city__name">${getNameCity(data.origin)}</span>
                  </div>
                  <div class="date">${normalCalendarDate(data.depart_date)}</div>
               </div>
         
               <div class="block-right">
                  <div class="changes">${getChanges(data.number_of_changes)}</div>
                  <div class="city__to">Город назначения:
                     <span class="city__name">${getNameCity(data.destination)}</span>
                  </div>
               </div>
            </div>
      </div>
      `;
   } else {
      deep = '<h3>К сожалению, на текущую дату билетов не нашлось<h3>'
   }
   ticket.insertAdjacentHTML(
      'afterbegin',
      deep
   )
   return ticket
}
const getLinkAviaSales = (data) => { // формируем ссылку на покупку билета
   let link = 'https://www.aviasales.ru/search/'
   link += data.origin;
   const date = new Date(data.depart_date)
   const day = date.getDate()
   link += day < 10 ? '0' + day : day
   const month = date.getMonth() + 1
   link += month < 10 ? '0' + month : month
   link += data.destination
   link += '1';
   // https://www.aviasales.ru/search/SVX2905KGD1
   console.log(link)
   return link
}
const renderCheapDay = (cheapTicket) => {
   const ticket = createCard(cheapTicket[0])
   cheapestTicket.append(ticket);
   console.log(ticket)
}
const renderCheapYear = (cheapTickets) => {
   const sortCheapTickets = cheapTickets.sort((ticketFirst, ticketSecond) => ticketFirst.value - ticketSecond.value)
   for (let index = 0; index < sortCheapTickets.length && index < MAX_COUNT; index++) {
      const ticket = createCard(sortCheapTickets[index]);
      otherCheapTickets.append(ticket)
   }
}
const renderCheap = (data, date) => {
   const cheapTicketYear = JSON.parse(data).best_prices
   const cheapTicketDay = cheapTicketYear.filter(obj => obj.depart_date === date)
   console.log(cheapTicketDay)
   renderCheapDay(cheapTicketDay)
   renderCheapYear(cheapTicketYear)
}

// EVENTS
inputCitiesFrom.addEventListener('input', () => {
   showCity(inputCitiesFrom, dropdownCitiesFrom)
})
dropdownCitiesFrom.addEventListener('click', function (event) {
   let target = event.target
   inputCitiesFrom.value = target.textContent
   this.textContent = ''
})
inputCitiesTo.addEventListener('input', () => {
   showCity(inputCitiesTo, dropdownCitiesTo)
})
dropdownCitiesTo.addEventListener('click', function (event) {
   let target = event.target
   if (target.tagName.toLowerCase() == 'li') {
      inputCitiesTo.value = target.textContent
      this.textContent = ''
   }
})
formSearch.addEventListener('submit', (event) => {
   event.preventDefault();
   const cityFrom = city.find(objCity => inputCitiesFrom.value === objCity.name)
   const cityTo = city.find(objCity => inputCitiesTo.value === objCity.name)
   const formData = {
      from: cityFrom,
      to: cityTo,
      when: inputDateDepart.value,
   }
   if (formData.from && formData.to) {
      const requestData = '?depart_date=' + formData.when +
         '&origin=' + formData.from.code +
         '&destination=' + formData.to.code +
         '&one_way=true&token=' + API_KEY;

      getData(proxy + calendar + requestData, (response) => {
         renderCheap(response, formData.when)
      });
   } else {
      alert('Введите корректное название города')
   }

})
getData(proxy + citiesApi, (data) => {
   city = JSON.parse(data)
})


