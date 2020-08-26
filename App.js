import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Principal.css'; 
import './App.css';
import Header from './components/Header/Header';
import PanelBusca from './components/PanelBusca/PanelBusca';
import Card from './components/Card/Card';
import CardDetail from './components/CardDetail/CardDetail';
import $ from "jquery";

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MySwal = withReactContent(Swal);

class App extends Component {

  constructor(props) {

    super(props);
    this.callOpenWeather = this.callOpenWeather.bind(this);
    this.callOpenWeatherDetail = this.callOpenWeatherDetail.bind(this);
    this.callApiHistorico = this.callApiHistorico.bind(this);

    this.state = {
      detalhes : [],
      erro: "",
      temperatura: "",
      cidade: "",
      descricao: "",
      pais: ""
    }
  }

  componentDidMount() {
    $( ".thumbnail" ).hide();  
  }

  callApiHistorico = async(dados) => {

    fetch("https://dashboard.heroku.com/apps/weather-app-apijorge/deploy/github/inserthistoric",{ method: 'POST', body: JSON.stringify(dados,),  
    headers:{
      'Content-Type': 'application/json'
     } })
      .then(res => res.json())
        .catch(error => {
          toast.error('Ocorreu um erro ao atualizar o histórico! ' + error.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            });
        })
        .then(
          (response) => {    
            toast.success('Histórico atualizado com sucesso!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
          },
      )  
  } 

  callOpenWeatherDetail = async (nomeCidade) => {

    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + nomeCidade +"&APPID=9ffe2ca11ecd1ca4ab7e197b55f4acfe&units=metric&lang=pt")
      .then(res => res.json())
      .then(
        (response) => {

          if (response.cod == 200){
            let count=0;
            let dados=[];
            let primeiraExe='S';
            let diaAnterior;
            let max_temperatura = 0;
            let min_temperatura = 999;
            let dataStrPT= "";
            let diasSemana = new Array('Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado');
            
            for (var key in response.list) {

              var obj = response.list[key];
              let dataObj  = new Date(obj.dt_txt);
              let dataAtual = new Date();

              // As vezes a previsão traz informações do dia atual...
              if (dataAtual.getDay() === dataObj.getDay())
                continue;

              dataStrPT=diasSemana[dataObj.getDay()];

              if ((diaAnterior !== dataStrPT) && (primeiraExe !== 'S') && (count!==4)){
                dados.push({data: obj.dt_txt.slice(0,10), datastr: diaAnterior, max_temp:max_temperatura.toFixed(0), min_temp:min_temperatura.toFixed(0),
                            descricao: obj.weather[0].description, vento_velocidade: obj.wind.speed});
                max_temperatura = 0;
                min_temperatura = 999;   
                count = count + 1;   
              }
              diaAnterior = dataStrPT;
              primeiraExe = 'N';

              if (obj.main.temp_max > max_temperatura)
                max_temperatura = obj.main.temp_max;

              if (obj.main.temp_min < min_temperatura)
                min_temperatura = obj.main.temp_min;
                
            }

            if (count = 4)
              dados.push({data: obj.dt_txt.slice(0,10), datastr: dataStrPT, max_temp:max_temperatura.toFixed(0), min_temp:min_temperatura.toFixed(0), 
                          descricao: obj.weather[0].description, vento_velocidade: obj.wind.speed });

            this.setState({
              detalhes:dados 
            });

              
            let reg = {cidade:this.state.cidade, previsao:[]};
            reg.previsao=dados;
            this.callApiHistorico(reg);            

          } else { 
            
            if (response.cod == 404)
              MySwal.fire(<p className="alerta">Cidade não encontrada!</p>);
            else 
              MySwal.fire(response.message);
          }
                   
        },
      
      )

  }

  callOpenWeather = async (e) => {
    e.preventDefault();
    let nomeCidade = e.target.elements.filtroCidade.value;

    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + nomeCidade +"&APPID=9ffe2ca11ecd1ca4ab7e197b55f4acfe&units=metric&lang=pt")
      .then(res => res.json())
      .then(
        (response) => {
          
          if (response.cod === 200){
            this.setState({
              temperatura: parseFloat(response.main.temp.toFixed(0)), 
              cidade: response.name,
              pais: response.sys.country,
              descricao: response.weather[0].description,
              error: ""
            });

            $( ".thumbnail" ).show();

          } else {
            let msg = "Ocorreu um erro ao realizar a busca.";

            if (response.cod === 404)
              msg = "Cidade não encontrada";

            this.setState({
              temperatura: "",
              cidade: "",
              pais: "",
              descricao: "",
              error: msg
            });

            $( ".thumbnail" ).hide();
          } 
        },
      
      )
      

    this.callOpenWeatherDetail(nomeCidade); 
    $( ".input-busca" ).val("");
  };

  render(){
    return (
      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
      />
        <Header />
          <div className="container body-content">
            <div className="body-content">
              <PanelBusca callOpenWeather={this.callOpenWeather} />
              <div className="row centered">
                <Card nomecidade={this.state.cidade} temperatura={this.state.temperatura} 
                      nomepais={this.state.pais} descricao={this.state.descricao}/>
                <div className="col-md-9">
                  <div className="col-md-12 thumbnail card-detail">
                    { this.state.detalhes && this.state.detalhes.map((c, i) => <CardDetail  key={i} max={c.max_temp} 
                                                                                min={c.min_temp} datastr={c.datastr} 
                                                                                desc={c.descricao} vento={c.vento_velocidade} />)}
                   
                  </div>
                </div>
              </div>
            </div>
          </div> 
      </div>                       
                                      
    );
  }
}

export default App;
