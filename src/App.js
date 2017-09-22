import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import FontAwesome from 'react-fontawesome';

class SmallWeatherInfo extends React.Component {
  getDate(date){
    const options = {
      day: 'numeric',
      weekday: 'short',
      timezone: 'UTC'
    }
    let time = new Date(date);
    return time.toLocaleString('en-GB', options);
  }

  render(){
    return(
        <li data-id={this.props.dataId} onClick={this.props.makesActive} className={'single-day ' + (this.props.dataId === this.props.isActive?'is-active-small':'')}>
          <div className='day-time'>{this.getDate(this.props.time)}</div>
          <img className='day-weather' height='30' src={'big-icons/' + (this.props.icon.match(/n/)?this.props.icon.replace(/n/, 'd'):this.props.icon) + '.png'} alt={this.props.icon.match(/n/)?this.props.icon.replace(/n/, 'd'):this.props.icon} />
          <div className='day-temp'>{this.props.temp} &deg;</div>
        </li>
    )
  }
}

class FullWeatherInfo extends React.Component {

  getFullDate(date){
    const options = {
      day: 'numeric',
      weekday: 'long',
      month: 'long',
      timezone: 'UTC'
    }
    let time = new Date(date);
    return time.toLocaleString('en-GB', options);
  }

  render(){
    return (
      <div>
        <div data-id={this.props.dataId} className={'single-day-full'}>
          <h1 className='day-time-full'>{this.getFullDate(this.props.time)}</h1>
          <img className='day-icon-full' src={'big-icons/' + (this.props.icon.match(/n/)?this.props.icon.replace(/n/, 'd'):this.props.icon) + '.png'} alt={this.props.icon.match(/n/)?this.props.icon.replace(/n/, 'd'):this.props.icon}/>
          <p className='day-temp-full'>{this.props.temp} &deg;</p>
          <p className='day-weather-full'>{this.props.weather}</p>
          <button className='return-button' onClick={this.props.backToStart}><FontAwesome name='refresh'></FontAwesome></button>
        </div>
        <div className='day-pressure-full'>
          <p>{this.props.pressure}</p>
          <img src='big-icons/17d.png' alt='pressure.png'/>
          <h1>pressure</h1>
        </div>
        <div className='day-humidity-full'>
          <p>{this.props.humidity}</p>
          <img src='big-icons/18d.png' alt='humidity.png'/>
          <h1>humidity</h1>
        </div>
        <div className='day-country-full'>
          <p>{this.props.city}</p>
        </div>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      initText: 'loading...',
    }
  }

  componentDidMount(){
    fetch('country-city-data.json')
      .then((response) => {
        if (response.status !== 200) {
          console.log('Status error: ' + response.status);
          return;
        } else {
          return response.json();
        }
      })
      .then((CCData) => {
        CCData.sort((a,b) => {
          if(a.nm < b.nm) return -1;
          if(a.nm > b.nm) return 1;
          return 0;
        })
        this.setState({
          CCData: CCData
        })
      })
    }

  getData = (ev) => {
      let resultLink = 'https://api.openweathermap.org/data/2.5/forecast?id=' + ev.target.getAttribute('data-city-id') + '&units=metric&appid=3ad0ec109fcb8d87875c504182f2cee5';
        fetch(resultLink)
          .then((response) => {
            if (response.status !== 200) {
              console.log('Status error: ' +response.status);
              return;
            } else {
              return response.json();
            }
          }
        )
        .then((data) => {
          this.setState({
            data: data,
            CCName: ev.target.getAttribute('data-CC-name')
          })
          return data;
        })
        .then((data) => {
          let initId = data.list.filter(function(item) {
            return item.dt_txt.match(/12:00:00/) != null
          })
          this.setState({
            isActiveId: initId[0].dt
          })
        })
        .catch((error) => {
          console.log('Fetch Error: ', error);
          this.setState({
            initText: 'Ops! looks like we caught an error'
          })
        })
      }

  openFullInfo(ev){
    let smallWeatherList = document.querySelectorAll('.single-day')
    for(let i = 0; i < smallWeatherList.length; i++){
      smallWeatherList[i].classList.remove('is-active-small')
    }
    if(ev.target.tagName === 'LI') {
      ev.target.classList.add('is-active-small')
      this.setState({
        isActiveId: Number(ev.target.getAttribute('data-id'))
      })
    } else {
      ev.target.parentElement.classList.add('is-active-small')
      this.setState({
        isActiveId: Number(ev.target.parentElement.getAttribute('data-id'))
      })
    }
  }

  searchCity(ev){
    // if(ev.key !== 'Enter' && ev.target.tagName !== 'BUTTON' && ev.target.tagName !== 'SPAN') return;
  let searchValue = this.refs.searchField.value;
  if(searchValue.length < 3) {
    this.refs.searchOutput.innerHTML = '';
    return;
  }
  this.refs.searchBoard.classList.add('is-searching');
  setTimeout(()=>{
    this.refs.searchOutput.innerHTML = '';
    for(let i = 0; i < this.state.CCData.length; i++){
      if(this.state.CCData[i].nm.toLowerCase().indexOf(searchValue.toLowerCase()) === -1) continue
      let listItem = document.createElement('LI');
      listItem.classList.add('search-result');
      listItem.setAttribute('data-city-id', this.state.CCData[i].id);
      listItem.setAttribute('data-CC-name',this.state.CCData[i].countryCode +', '+ this.state.CCData[i].nm);
      listItem.addEventListener('click', this.getData);
      listItem.innerHTML = this.state.CCData[i].nm + ' - ' + this.state.CCData[i].countryCode;
      this.refs.searchOutput.appendChild(listItem);
      }
    }, 300)
  }
  backToStart(){
    this.setState({
      CCName: '',
      data: ''
    })
  }

  render() {
    if(!this.state.CCName) return (
      <div ref='searchBoard' className='search-board'>
        <div className='search-button'><FontAwesome name='search' className='search-fa' /></div>
        <input className='search-field' ref='searchField' type='text' placeholder='city' onChange={this.searchCity.bind(this)} />
        <ul ref='searchOutput' className='search-output'></ul>
      </div>
    )
    if(!this.state.data) return <p className='notification'>{this.state.initText}</p>
    return (
      <div className='weather-board'>
        <ul className="small-weather-info">
          {this.state.data.list.map((item,i) => {
              if(!item.dt_txt.match(/12:00:00/)) return;
              return (
                <SmallWeatherInfo
                  dataId={item.dt}
                  makesActive={this.openFullInfo.bind(this)}
                  isActive={this.state.isActiveId}
                  key={i}
                  time={item.dt_txt}
                  temp={Math.round(item.main.temp)}
                  icon={item.weather[0].icon}/>
              )
            }
          )}

        </ul>

        <div className='full-weather-info'>
          <ReactCSSTransitionGroup
            transitionName='fade'
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
          {this.state.data.list.map((item,i) => {
            if(!item.dt_txt.match(/12:00:00/)) return;
            if(item.dt !== this.state.isActiveId) return;
            return (
                <FullWeatherInfo
                  key={i}
                  backToStart={this.backToStart.bind(this)}
                  time={item.dt_txt}
                  temp={Math.round(item.main.temp)}
                  weather={item.weather[0].description}
                  icon={item.weather[0].icon}
                  pressure={Math.round(item.main.grnd_level)}
                  humidity={item.main.humidity}
                  city={this.state.CCName}
                />
              )
            }
          )}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}

export default App;
