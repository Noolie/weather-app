import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
          <img className='day-weather' height='30' src={'big-icons/' + this.props.icon + '.png'} alt={this.props.icon} />
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
          <img className='day-icon-full' src={'big-icons/' + this.props.icon + '.png'} alt={this.props.icon}/>
          <p className='day-temp-full'>{this.props.temp} &deg;</p>
          <p className='day-weather-full'>{this.props.weather}</p>
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
          <p>Ukraine, Odessa</p>
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
    fetch('http://api.openweathermap.org/data/2.5/forecast?q=Odessa,ua&units=metric&appid=3ad0ec109fcb8d87875c504182f2cee5')
      .then((response) => {
          if (response.status !== 200) {
            console.log('Status error: ' +
              response.status);
            return;
          } else {
            return response.json();
          }
        }
      )
      .then((data) => {
        this.setState({
          data: data
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
      });
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

  render() {
    if(!this.state.data) return <p>{this.state.initText}</p>
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
                  time={item.dt_txt}
                  temp={Math.round(item.main.temp)}
                  weather={item.weather[0].description}
                  icon={item.weather[0].icon}
                  pressure={Math.round(item.main.grnd_level)}
                  humidity={item.main.humidity}
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
