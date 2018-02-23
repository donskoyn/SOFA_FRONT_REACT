// $().ready(main);

const theUrl = "https://olimshelper.herokuapp.com/";//api
const MIN_KM=1;
const MAX_KM = 10;
const INC = 1;
let stepColors= [
    "#00508c",
    "#35a000",
    "#c67a00",
    "#a00092",
    "#ba1a00",
    "#3a008c",
    "#d29600",
    "#ba002b",
    "#50008c"
];//colors for steps
let lat = 0;//latitude
let lon = 0;//longitude
let map = null;//google maps
let myMarker = null;//the marker which shows your location
let markers = [];//markers on map
let bounds = null;

let icons = [
    "images/mk_grey.png",
    "images/mk_step_01.png",
    "images/mk_step_02.png",
    "images/mk_step_03.png",
    "images/mk_step_04.png",
    "images/mk_step_05.png",
    "images/mk_step_06.png",
    "images/mk_step_07.png",
    "images/mk_step_08.png",
    "images/mk_step_09.png",
    "images/ic_my_location.png"
];//icons for markers
let geocoder;//with this you decode placeId to get more information
let closeBtnText = {
    en: "CLOSE",
    ru: "ЗАКРЫТЬ",
    he: "לסגור",
    fr: "FERMER"
};
let showRouteBtnText = {
    en: "SHOW ROUTE",
    ru: "ПОКАЗАТЬ ПУТЬ",
    he: "להראות את הדרך",
    fr: "MONTRER LE CHEMIN"
};
let goToTheSiteBtnText = {
    en: "GO TO THE SITE",
    ru: "ПЕРЕЙТИ К САЙТУ",
    he: "עבור אל האתר",
    fr: "ALLER AU SITE"
};
let phonesText = {
    en: "PHONES",
    ru: "ТЕЛЕФОНЫ",
    he: "טלפונים",
    fr: "TELEPHONES"
};
let scheduleText = {
    en: "SCHEDULE",
    ru: "РАСПИСАНИЕ",
    he: "לוח זמנים",
    fr: "HORAIRE"
};
let myLocationText={
    en: "my location",
    ru: "мое расположение",
    he: "המיקום שלי",
    fr: "mon emplacement"
};
let weekDay ={ 
    en:[
        "sun","mon","tue","wed","thu","fri","sat"
    ],
    ru:[
        "вск","пон","втр","срд","чтв","птн","сбт"
    ],
    he:[
        "א", "ב","ג","ד","ה","ו","ש"
    ],
    fr:[
        "dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"
    ],
};//this will be required when you look info about marker
let fullLangName = {
    en: "English",
    ru: "Russian",
    he: "Hebrew",
    fr: "French"
}
//options for google maps
var options = {
    enableHighAccuracy: true,
    maximumAge: 0
};
let cityList = [];//the list of cities which will appear when geolocation is locked
let currentCity;
let showTheInfo = false;


//TODO rewrite everything from main to react
function main(){//intialise everything
    $('.scroll-back').click(function () {
        $('.sofa-horiz').animate({
            scrollLeft: '-=271'
        }, 500, 'linear');
    });//scroll steps back
    $('.scroll-forward').click(function () {
        $('.sofa-horiz').animate({
            scrollLeft: '+=271'
        }, 500, 'linear');
    });//scroll steps forward
    setInfoHeight();
}

function onInfoBtnClick(){
    showTheInfo = !showTheInfo;
    toggleShowInfo(showTheInfo);
}

function setInfoBtnClick(){
    $(".info-head").click(
        function(){
            showTheInfo = !showTheInfo;
            toggleShowInfo(showTheInfo);
        }
    )
}

function toggleShowInfo(toShow){
    if(toShow){
        $(".info-of-step").show();
        $(".description-help").hide();
        $(".info-of-marker").hide();
        
    }
    else{
        $(".info-of-step").hide();
        $(".description-help").show();
        $(".info-of-marker").show();
    }
}

function setInfoHeight(){
    if(window.innerWidth>767){
        document.getElementsByClassName("step-description")[0].style.gridTemplateColums = 
        (window.innerHeight-document.getElementsByClassName("step-description")[0].getBoundingClientRect().y-10)+"px";
        document.getElementsByClassName("sofa-map")[0].style.height = 
        (window.innerHeight-document.getElementsByClassName("sofa-map")[0].getBoundingClientRect().y-10)+"px";
    }
}

function showLoading(){
    $(".loading-window").show(0);
}

function hideLoading(){
    $(".loading-window").hide(100);
}

function setRightTextAlign(){
    $(".info-of-step").css("text-align","right");
    // $(".menu-item p").css("text-align","right");
    
}

function setLeftTextAlign(){
    $(".info-of-step").css("text-align","left");
    // $(".menu-item p").css("text-align","left");
}

//set the color of header of info of step according to chosen step
function setColorHeaderInfo(currentStep){
    $(".step-header").css("background-color",stepColors[currentStep]);
}

//set the info according to step
function setInfo(steps,numbStep){
    console.log(steps[numbStep].title)
    $(".step-head").text(steps[numbStep].title);
    $(".description-text").text(steps[numbStep].description);
    $(".step-need").text(steps[numbStep].need);
    $(".step-img").attr("src","images/step_0"+(numbStep+1)+".png");
}

//set the names of steps according to current language
function setSelectSteps(steps){
    for(var i=0;i<steps.length;i++){
        $("#item"+(i+1)+" > .choose-step").text(steps[i].title);
    }
}

//highlight the chosen language
function highlightLanguage(nowLanguage){
    let langs = $(".changeLang");
    for(var i=0; i< langs.length; i++){
        langs[i].style.color = "rgba(110,110,110,1)";
    }
    $(`#${nowLanguage}`).css("color", "#00508c");
}

//set the site title to name according to language
function setTitleText(nowLanguage){
    let title = $(".title-text");
    switch(nowLanguage){
        case "en":
            title.text("10 STEPS OF A NEW REPATRIATE");
            break;
        case "ru":
            title.text("10 ШАГОВ НОВОГО РЕПАТРИАНТА");
            break;
        case "he":
            title.text("עשר שלבים של עולה חדש");
            break;
        case "fr":
            title.text("10 ÉTAPES D'UN NOUVEAU RAPATRIANT");
            break;
        default:
            title.text("10 STEPS OF A NEW REPATRIATE");
            break;
    }
}

function changePosition(lat,lon,lang,step){
    myMarker.setPosition({lat:lat,lng:lon});
    map.setCenter({lat:lat,lng:lon});
    fillMapWithPlaces(map,lang,step,lat,lon,MIN_KM,MAX_KM,INC);
}



function setMap(lat,lon,lang,step){
    map = null;
    var icon = {
        url: icons[10], // url
        scaledSize: new google.maps.Size(20, 20), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };//set icon for my position
    var uluru = {lat: lat, lng: lon};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: uluru,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });//create map
    myMarker = new google.maps.Marker({
        position: uluru,
        map: map,
        icon: icon,
        zIndex: 2
    });//put marker
    fillMapWithPlaces(map,lang,step,lat,lon,MIN_KM,MAX_KM,INC);//fill the map with markers
}


//if succesided to get geolocation
function successMap(pos,lang,step){
    currentCity = "0";
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    setMap(lat,lon,lang,step);
    console.log(app);
    app.changeGlobalPosition(lat,lon);
    app.setCurrentCity(lat+"|"+lon+"|0");
    return [lat,lon];
}

//if geolocation error happened
function errorMap(err,lang,step) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    if(app.state.currentCity=="null"){
        let urlCurr = theUrl + `${lang}/city`;
        $.ajax({
            url: urlCurr
        })
        .then(
            (data)=>{
                cityList = data;
                let TelAviv = null;
                let indexCity = 0;
                TelAviv = data.find(
                    (city,i)=>{
                        if(city.name=="Tel Aviv"||city.name == "תל אביב"||city.name=="Тель-Авив"){
                            indexCity=i;
                            return city;
                        }
                    }
                );
                currentCity = TelAviv.latitude+"|"+TelAviv.longitude;
                let lat = TelAviv.latitude;
                let lon = TelAviv.longitude;
                setMap(lat,lon,lang,step);
                // document.getElementsByClassName("the-list")[0].value = currentCity;
                hideLoading();
                app.changeGlobalPosition(lat,lon);
                app.setCurrentCity(lat+"|"+lon+"|"+indexCity);
                return [lat,lon];
            }
        );
    }
    else{
        document.getElementsByClassName("the-list")[0].value = currentCity;
        return [currentCity.split("|")[0],currentCity.split("|")[2]];
        hideLoading();
    }
};

$(window).on( 'resize',
  function(){
      google.maps.event.trigger( map, 'resize' );
  }
);//resize the map

function clearMap(){//clear markers
    if(markers.length>0){
        for(var i=0; i<markers.length; i++){
            markers[i].setMap(null);
        }
        markers=[];
    }
}

function highlightMarker(n){//highlight the chosen marker
    for(let i=0; i<markers.length;i++){
        if(i!=n){//if it is not our marker
            var icon = {
                url: icons[0], // url
                scaledSize: new google.maps.Size(20, 30), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            };//new icon(grey one)
            markers[i].setIcon(icon);//set the grey icon
        }
        else{
            markers[i].setZIndex(1);
        }
    }
}

function unhighlightMarkers(step){//unhilight all markers
    for(let i=0; i<markers.length;i++){
        var icon = {
            url: icons[step+1], // url
            scaledSize: new google.maps.Size(20, 30), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };//the icon according to current step
        markers[i].setIcon(icon);//set the icon
        markers[i].setZIndex(0);
    }
}

//event when marker was clicked
function onAddressClick(sofaAddress,markerNumber,place,lang,step){
    // $(".sofa-address").hide(0);//hide all markers
    $(".description-help").css("grid-column","1");
    $(".div-to-remove").remove();
    highlightMarker(markerNumber);//highlight the chosen marker on the map
    let infoOfMarker = $(".info-of-marker");//get the marker container
    let divToRemove =document.createElement("div");//create the element where the information about marker would be put, so that it could easily be removed without deleting data about all markers
    divToRemove.className = "div-to-remove";
    infoOfMarker.append(divToRemove);

    let divWrap = document.createElement("div");//create wrapper
     divToRemove.appendChild(divWrap);

    let markerInfo = document.createElement("div");//create a button to close the info about current marker
    markerInfo.className="marker-holder";
    divWrap.appendChild(markerInfo);
    let showBtn = document.createElement("button");
    showBtn.innerText = showRouteBtnText[lang];
    showBtn.className = "marker-btn";
    // console.log(`https://www.google.com/maps/dir/?api=1&origin=${myMarker.getPosition().lat()},${myMarker.getPosition().lng()}&destination=${place.latitude},${place.longitude}`);
    showBtn.onclick = function(){
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${myMarker.getPosition().lat()},${myMarker.getPosition().lng()}&destination=${place.latitude},${place.longitude}`,`_blank`);
    }
    markerInfo.appendChild(showBtn);
    let urlBtn = document.createElement("button");
    urlBtn.innerText = goToTheSiteBtnText[lang];
    urlBtn.className = "marker-btn";
    urlBtn.onclick = function(){
        window.open("http://"+place.url,"_blank");
    }
    markerInfo.appendChild(urlBtn);
    let closeBtn = document.createElement("button");
    closeBtn.innerText = closeBtnText[lang];
    closeBtn.className = "marker-btn";
    closeBtn.onclick = function(){
        closeCurrentMarker(step);
        $(".description-help").css("grid-column","1/3");
    }
    markerInfo.appendChild(closeBtn);
    

    markerInfo = document.createElement("div");//create wrapper which sometimes would be a grid or not depending on the className
    markerInfo.className = "div-to-make-flex-work";
    divWrap.appendChild(markerInfo);
    let nameH5 = document.createElement("h5");//put the name of the marker
    nameH5.innerText = place.name;
    nameH5.className = "make-flex";
    markerInfo.appendChild(nameH5);

    let phoneH6 = document.createElement("h6");//put the name of the marker
    phoneH6.innerText = phonesText[lang]+ ":";
    divWrap.appendChild(phoneH6);

    for(var j=0; j<place.phones.length; j++){//put the phone numbers of current marker
        markerInfo = document.createElement("div");
        markerInfo.className = "div-to-make-flex-work";
        divWrap.appendChild(markerInfo);
        let phoneP = document.createElement("p");
        phoneP.className = "make-flex";
        phoneP.innerText = place.phones[j];
        markerInfo.appendChild(phoneP);
    }

    let scheduleH6 = document.createElement("h6");//put the name of the marker
    scheduleH6.innerText = scheduleText[lang]+ ":";
    divWrap.appendChild(scheduleH6);

    for(var k=0; k<7;k++){//put the schedule of current marker
        markerInfo = document.createElement("div");
        markerInfo.className = "marker-info";
        divWrap.appendChild(markerInfo);
        let scheduleP = document.createElement("p");
        scheduleP.className = "make-flex";
        let strDay = place.schedule[k];
        let nameWeek = document.createElement("p");
        nameWeek.className = "make-flex";
        nameWeek.innerText = weekDay[lang][k];
        scheduleP.innerText = strDay;
        markerInfo.appendChild(nameWeek);
        markerInfo.appendChild(scheduleP);
    }
}

function closeCurrentMarker(step){//close the clicked marker
    unhighlightMarkers(step);
    $(".div-to-remove").remove();//remove all previous data about the marker
    $(".sofa-address").show(0);//show all markers
}

//fill the list of markers
function fillSofaAddresses(places,lang,step){
    let descriptionHelp = $(".description-help");//get the container of markers
    descriptionHelp.empty();//empty it from previous markers
    if(places.length>0){//if there are any places
        for(let i=0; i<places.length; i++){
            let sofaAddress = document.createElement("div");//create the div which contains some information about the marker
            sofaAddress.className = "sofa-address pointable marker"+i;//set the class name for it to set styles from css
            descriptionHelp.append(sofaAddress);//appendChild it to element where it should be contained
            sofaAddress.onclick = ()=> onAddressClick(sofaAddress,i,places[i],lang,step);// set the click event. when it clicked the more information appears

            let placeImg = document.createElement("img");
            placeImg.src=`http://www.google.com/s2/favicons?domain=${places[i].url}`;
            placeImg.height = 24;
            placeImg.width = 24;
            placeImg.className = "img-place";
            sofaAddress.appendChild(placeImg);

            let nameH5 = document.createElement("h5");//add the name of marker
            nameH5.innerText = places[i].name;
            nameH5.className = "name-place";
            sofaAddress.appendChild(nameH5);

            let holdOpenButton = document.createElement("p");
            holdOpenButton.className = "expand-button";
            holdOpenButton.innerText = "V";
            sofaAddress.appendChild(holdOpenButton);

            let addressP = document.createElement("p");//add the address for marker
            let addressString = "";
            addressP.className = "address-name";
            // console.log(places[i]);
            geocoder.geocode({"placeId":places[i].placeId},//decode the placeId to get address
            function(res, status){
                geocodeFunc(res,status,places[i].placeId,addressP,sofaAddress);
            });
        }
    }
}

function geocodeFunc(res,status,placeId,addressP,sofaAddress){
    if(status=="OK"){
        let aC = res[0].address_components;
        let addressString = `${aC[2].long_name}, ${aC[1].short_name}, ${aC[0].short_name}`;
        addressP.innerText = addressString;
        sofaAddress.appendChild(addressP);
    }
    else{//TODO what should happen when you dont get the address(it happens a lot more frequently than expected)
        console.log(status);
        addressP.innerText = addressString;
        sofaAddress.appendChild(addressP);
    }
}

//fill the map with markers
function fillMapWithPlaces(map,lang,step,lat,lon,min,max,inc){
    if(map!=null){//if the map was initialized
        let urlCurr = theUrl+`step/${lang}/${step+1}/area/${lat}/${lon}/${min}/${max}/${inc}`;//url request
        // console.log(myMarker.getPosition());
        bounds = new google.maps.LatLngBounds();
        bounds.extend(myMarker.getPosition());
        $.ajax({
            url: urlCurr
        })
        .then(function(placesArr){
            clearMap();//clear map from markers if threre are already some
            
            if(placesArr.length!=0){//if there are any places
                
                for(var i=0;i<placesArr.length;i++){
                    let icon = {
                        url: icons[step+1], // url
                        scaledSize: new google.maps.Size(20, 30), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    };//set the icon for marker
                    let marker = new google.maps.Marker({
                        map: map,
                        icon: icon,
                        place: {
                        placeId: placesArr[i].placeId,
                        location: { lat: placesArr[i].latitude, lng: placesArr[i].longitude}
                        },
                        zIndex: 0
                    });//set marker
                    bounds.extend({ lat: placesArr[i].latitude, lng: placesArr[i].longitude});
                    markers.push(marker);//push marker to gloabal array so that you could delete them in future or change icons

                }
                map.fitBounds(bounds);
                fillSofaAddresses(placesArr,lang,step);//fill the div with information about markers
            }
            else{
                let infoOfMarker = $(".info-of-marker");
                infoOfMarker.empty();
                $(".sofa-address").empty();
                console.log("no places found");
            }
        });
        hideLoading();
    }
    
}

function initMap(){//initialize the google map
    bounds = new google.maps.LatLngBounds();
    geocoder = new google.maps.Geocoder;//get the geocoder to decode placeIds in further
    navigator.geolocation.getCurrentPosition(
        function(pos){return successMap(pos,"en",0)},
        function(err){return errorMap(err,"en",0)}, 
        options);//get location
}

class LoadingWindow extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        return <div class="loading-window">
                    <p class="loading-text">LOADING...</p>
                </div>
    }
}

class IconImage extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        return <h4 class="hold-main-pic margin-to-zero"><img height="19" src="images/splash_logo.png" alt="SOFA"/></h4>;
    }
}

class Title extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            title: "10 STEPS OF A NEW REPRESENTATIVE"
        }
        //TODO update title
    }

    updateTitle = (newTitle) => {this.setState({title: newTitle})}

    render(){
        return <h4 class="title-text set-margin-for-header">{this.state.title}</h4>;
    }
}

class LocationList extends React.Component{
    constructor(props){
        super(props);
        // console.log("constructor city list")
        this.state = {
            currentCityIndex: this.props.currentCity.split("|")[2],
            currentCity: this.props.currentCity
        }
        // console.log("constructor city list")
    }

    onCityChange = (e,lang,step) =>{
        // console.log("onchange")
        let theCurrentCity = e.target.value;
        if( theCurrentCity!="0"){
            let coords = theCurrentCity.split("|");
            let lat = +coords[0];
            let lon = +coords[1];
            this.props.changeGlobalPosition(lat,lon);
            console.log(theCurrentCity)
            changePosition(lat, lon,lang,step);
            this.setState({
                currentCity: theCurrentCity,
                currentCityIndex: +coords[2]
            });
        }
        else{
            navigator.geolocation.getCurrentPosition(
                function(pos){return successMap(pos,lang,step)},
                function(err){return errorMap(err,lang,step)}, 
                options);//get location
        }
    }

    eachCity = (city,i) =>{
        let strCoords = city.latitude+"|"+city.longitude;
        let strCoordsI = strCoords+"|"+i;
        // if(strCoords==this.state.currentCity){
        //     this.setState({currentCityIndex: i});
        // }
        // console.log(strCoords+" : "+this.props.currentCity)
        if(strCoords==this.props.currentCity){
            console.log(<option selected value={strCoordsI} name={city.name}>{city.name}</option>)
            return <option selected value={strCoordsI} name={city.name}>{city.name+"!!!"}</option>
        }
        else{
            return <option value={strCoordsI} name={city.name}>{city.name}</option>
        }
    }

    render(){
        // console.log("list of cities")
        console.log(this.props.currentCity)
        if(this.state.currentCity=="null"){
            return <div class="hold-list-div">
                        <div class="control-list-div">
                            <select 
                                value={this.props.currentCity}
                                class="the-list"
                                onChange={((e)=>this.onCityChange(e,this.props.nowLanguage,this.props.currentStep))}
                            >
                                <option value="0" name={myLocationText[this.props.nowLanguage]}>{myLocationText[this.props.nowLanguage]}</option>
                                {this.props.cityList.map(this.eachCity)}
                            </select>
                        </div>
                    </div>
        }
        else{
            return <div class="hold-list-div">
            <div class="control-list-div">
                <select 
                    value={this.state.currentCity}
                    class="the-list"
                    onChange={((e)=>this.onCityChange(e,this.props.nowLanguage,this.props.currentStep))}
                >
                    <option value="0" name={myLocationText[this.props.nowLanguage]}>{myLocationText[this.props.nowLanguage]}</option>
                    {this.props.cityList.map(this.eachCity)}
                </select>
            </div>
        </div>
        }
    }
}

class CityList extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            cityList: [],
            cityValueList: []
        }
    }

    //TODO build list according to names
    //TODO set clicks

    eachCity = (city,i) => {return <option value = {this.state.cityValueList[i]}>{city}</option>};

    upadateCityList = (newCityList, newCityValues) =>{
        this.setState({
            cityList: newCityList,
            cityValueList: newCityValues
        });
    };

    render(){
        return <div class="hold-search margin-to-zero">
                    <div class="control-list-div">
                        <LocationList 
                            cityList={this.props.cityList}
                            currentCity={this.props.currentCity}
                            changeGlobalPosition={this.props.changeGlobalPosition}
                            nowLanguage={this.props.nowLanguage}
                            currentStep={this.props.currentStep}
                        />
                    </div>
                </div>;
    }
}

class Languages extends React.Component{
    
    constructor(props){
        super(props);
    }

    //TODO set clicks

    render(){
        // console.log(this.props.setLanguage)
        return <div class = "languages">
                        <p><a class="changeLang pointable" onClick={()=>{this.props.setLanguage("en")}} id="en">EN</a></p>
                        <p><a class="changeLang pointable" onClick={()=>{this.props.setLanguage("ru")}} id="ru">RU</a></p>
                        <p><a class="changeLang pointable" onClick={()=>{this.props.setLanguage("he")}} id="he">HE</a></p>
                        <p><a class="changeLang pointable" onClick={()=>{this.props.setLanguage("fr")}} id="fr">FR</a></p>     
                    </div>;
    }
}

class TextSize extends React.Component{
    
    constructor(props){
        super(props);
    }

    //TODO set clicks

    render(){
        return <div class="textSize">
                    <p id="plus-text" onClick={()=>{this.props.resizeText(0.1)}} class="resizeText pointable">+</p>
                    <p>A</p>
                    <p id="minus-text" onClick={()=>{this.props.resizeText(-0.1)}} class="resizeText pointable">-</p>
                </div>;
    }
}

class SofaStepHeader extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            infoBtnText: ["INFO","MARKERS"],
            nowInfoIndex: 0
        };
        this.onInfoBtnClick = this.onInfoBtnClick.bind(this);
        // this.updateStepHeadName = this.updateStepHeadName.bind(this);
    }

    //TODO update step head name
    //TODO set clicks
    updateInfoBtnText = () =>{this.setState({nowInfoIndex: (++this.state.nowInfoIndex)%2})};

    onInfoBtnClick(){
        // console.log("click");
        showTheInfo = !showTheInfo;
        // toggleShowInfo(showTheInfo);
        this.props.showInfoCallback();
        this.updateInfoBtnText();
        // console.log(this.state.stepHeadName);
    }

    render(){
        // console.log(this.props.steps)
        return <div class="step-header">
                    <img class="step-img" src={"images/step_0"+(this.props.currentStep+1)+".png"}/>
                    <p class="step-head">{this.props.steps[this.props.currentStep].title.toUpperCase()}</p>
                    <p onClick={this.onInfoBtnClick} class="info-head pointable">{this.state.infoBtnText[this.state.nowInfoIndex]}</p>
                </div>
    }
}

class InfoOfStep extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            toShow: this.props.toShow
        }
    }

    //TODO update state values

    updateDescriptionText = (newDescriptionText) =>{this.setState({descriptionText: newDescriptionText})};
    updateStepNeedText = (newStepNeedText) => {this.setState({stepNeedText: newStepNeedText})};

    toggleShowInfo = ()=>{
        this.setState({toShow:!this.state.toShow});
    }

    render(){
        return <div class="info-of-step"  style={{"font-size":this.props.textSize+"em"}}>
                    <div class="description-text">{this.props.steps[this.props.currentStep].description}</div>
                    <div class="step-need">{this.props.steps[this.props.currentStep].need}</div>
                </div>
    }
}

class HelpDescription extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            toShow: this.props.toShow
        }
    }

    toggleShowMarker =()=>{this.setState({toShow:!this.state.toShow})}

    render(){
        return <div class="description-help">
        
                </div>
    }
}

class InfoAboutMarker extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        return <div class="info-of-marker"></div>
    }
}

class DescriptionOfStep extends React.Component{
    
    constructor(props){
        super(props);
        this.state= {
            toShow: this.props.toShow
        }
    }

    render(){
        if(this.props.toShow){
            return <div class="step-description">
                        <InfoOfStep 
                            textSize={this.props.textSize}
                            steps={this.props.steps}
                            currentStep={this.props.currentStep}/>
                    </div>
        }
        else{
            return <div class="step-description">
                        <HelpDescription/>
                        <InfoAboutMarker/>
                    </div>
        }
    }
}

class SofaStep extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            toShow: false
        };
    }

    showInfoCallback = () =>{
        this.setState({toShow: !this.state.toShow});
        
    };

    render(){
        return <section class="sofa-step">
                    <SofaStepHeader 
                        showInfoCallback={this.showInfoCallback}
                        steps={this.props.steps}
                        currentStep={this.props.currentStep}/>
                    <DescriptionOfStep 
                        toShow={this.state.toShow} textSize={this.props.textSize}
                        steps={this.props.steps}
                        currentStep={this.props.currentStep}/>
                </section>
    }
}

class SofaMap extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        return <section class="sofa-map" id="map">
                </section>
    }
}

class SofaHoldInfo extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        return <section class="hold-info main-section">
                    <div class="the-info">
                        <SofaStep 
                            textSize={this.props.textSize}
                            steps={this.props.steps}
                            currentStep={this.props.currentStep}/>
                        <SofaMap/>
                    </div>
                </section>
    }
}

class SofaContent extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            stepColor: "#00508c",
            stepClicked: false
        }
    }

    clickOnStep = (steps,cS) => {
        $(".description-help").css("grid-column","1/3");
        $(".div-to-remove").remove();
        // this.setState({currentStep: cS});
        this.props.changeCurrentStep(cS);
        console.log(steps)
        setColorHeaderInfo(cS);//set color for header of info according to chosen step
        setInfo(steps,cS);//set the info according to the step
        fillMapWithPlaces(map,this.props.nowLanguage,cS,this.props.lat,this.props.lon,MIN_KM,MAX_KM,INC);//fill the map with markers according to the step
    }

    render(){
        // console.log("SofaContent : "+this.state.currentStep)
        return <div class="sofa-row main-section">
                    <div class="sofa-content">
                        <div class="empty_column"></div>
                        <SofaHorizScrollMenu 
                            steps={this.props.steps}
                            clickOnStep={this.clickOnStep}/>
                        <SofaHoldInfo 
                            textSize={this.props.textSize}
                            steps={this.props.steps}
                            currentStep={this.props.currentStep}/>
                    </div>
                </div>
    }
}

class SofaHorizScrollMenu extends React.Component{
    
    constructor(props){
        super(props);
    }

    

    render(){
        return <section class="scroll-horiz main-section">
                    <SofaHorizScrollMenuBody 
                        steps={this.props.steps}
                        clickOnStep={this.props.clickOnStep}/>
                    <HorizScrollButtonHolder
                    />
                </section>
    }
}

class SofaHorizScrollMenuBody extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            steps: this.props.steps
        }
    }

    //TODO update step names
    //TODO set clicks

    eachStepName = (step,i) =>{
        // onClick={()=>{this.props.clickOnStep(this.state.stepNames,i+1)}}
        return <a href="#" id={`item${i+1}`} class=" menu-item" onClick={()=>{this.props.clickOnStep(this.props.steps,i)}}>
                    <img class="step-image" src={`images/step_0${i+1}.png`}/>
                    <p class="choose-step">{step.title}</p>
                </a>
    }

    render(){
        // console.log("drawing horiz scroll");
        // console.log(this.props.steps)
        return <section class="sofa-horiz">
                {this.props.steps.map(this.eachStepName)}
                <a id="item-filler"></a>
            </section>
    }
}

class HorizScrollButtonHolder extends React.Component{
    
    constructor(props){
        super(props);
    }

    //TODO set clicks

    render(){
        return <section class="scrollbutton-holder">
                    <a class="scroll-back pointable"><h1>{"<"}</h1></a>
                    <a class="scroll-forward pointable"><h1>{">"}</h1></a>
                </section>
    }
}

class SideMenu extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        return <section class="real-side-menu">
                    <Languages 
                        setLanguage={this.props.setLanguage}
                        currentStep={this.props.currentStep}/>
                    <TextSize resizeText={this.props.resizeText}/>
                </section>
    }
}

class CasualMenu extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        return <div class="cas-menu">
                    <IconImage/>
                    <Title/>
                    <CityList 
                        cityList={this.props.cityList}
                        currentCity={this.props.currentCity}
                        changeGlobalPosition={this.props.changeGlobalPosition} 
                        nowLanguage={this.props.nowLanguage}
                        currentStep={this.props.currentStep}
                    />
                </div>
    }
}

class SofaHeader extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){
        // console.log(this.props.setLanguage)
        return <header class="sofa-header">
                    <CasualMenu  
                        cityList={this.props.cityList}
                        currentCity={this.props.currentCity}
                        changeGlobalPosition={this.props.changeGlobalPosition}
                        nowLanguage={this.props.nowLanguage} 
                        currentStep={this.props.currentStep}/>
                    <SideMenu 
                        resizeText={this.props.resizeText}
                        setLanguage={this.props.setLanguage}
                        currentStep={this.props.currentStep}
                        />
                </header>
    }
}


function loadJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore(script, ref);
}

class App extends React.Component{

        constructor(props){
            super(props);
            this.state = {
                textSize: 1,
                steps: this.props.steps,
                currentStep: 0,
                nowLanguage: "en",
                lat: 32.0852999,
                lon: 34.78176759999999,
                cityList: [],
                currentCity: "null"
            }
            this.getCityList(this.state.nowLanguage, this.state.currentStep);
        }

        changeCurrentStep = (step) => {
            this.setState({currentStep: step});
        }

        setCurrentCity = (currentCity) => {
            this.setState({currentCity: currentCity});
        }

        getCityList = (lang,step) =>{
            let urlCurr = theUrl + `${lang}/city`;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", urlCurr, true);
            xhr.onload = function(){
                this.setState({cityList: JSON.parse(xhr.response)});
            }.bind(this);
            xhr.send();
        }

        setDataByLang = (lang)=>{
            showLoading();
            setTitleText(lang);//set new title according to language you chose
            highlightLanguage(lang);//highlight the chosen language
            fillMapWithPlaces(map,lang,this.state.currentStep,this.state.lat,this.state.lon,MIN_KM,MAX_KM,INC);//fill the map with markers
            if(map)
            hideLoading();
        }

        getAndSetDataByLang = (lang)=>{
            showLoading();
            $(".div-to-remove").remove();
            let urlCurr = theUrl+lang;//url to get info by language
            let xhr = new XMLHttpRequest()
            xhr.open("GET", urlCurr, true);
            xhr.onload = function(e){
                let data = JSON.parse(xhr.response);
                lang=="he"?setRightTextAlign():setLeftTextAlign();
                let steps = data.steps;//get info about steps
                console.log(steps)
                steps.sort((a,b)=>a.numberOfStep-b.numberOfStep);//sort the array of objects, because steps are not in the right order
                this.setState({steps:steps});
                console.log(this.state.steps);
                setTitleText(lang);//set new title according to language you chose
                highlightLanguage(lang);//highlight the chosen language
                fillMapWithPlaces(map,lang,this.state.currentStep,this.state.lat,this.state.lon,MIN_KM,MAX_KM,INC);//fill the map with markers
                if(map)
                hideLoading();
            }.bind(this);
            xhr.onerror = function(e){
                console.log(e)
            }
            xhr.send();
        }
    
        componentDidMount() {
            loadJS("https://maps.googleapis.com/maps/api/js?key=AIzaSyB6thMLQSj4zVrofw-UAUkXu_5_D3ucCEI&callback=initMap");
            main();
            this.setDataByLang("en");
        }

        textSizeCallback = (inc) =>{
            this.setState({textSize: this.state.textSize+inc});
        }

        setLanguage = (lang) =>{
                this.setState({
                    nowLanguage: lang
                });
                this.getCityList(lang, this.state.currentStep);
                this.getAndSetDataByLang(lang);//set the data according to langugage you chose
        };

        changeGlobalPosition =(lat, lon)=>{
            this.setState({
                lat: lat,
                lon: lon
            });
        }
    
        render(){
            // console.log(this.setLanguage)
            return <div>
                        <LoadingWindow/>
                        <SofaHeader 
                            cityList={this.state.cityList}
                            currentCity={this.state.currentCity}
                            changeGlobalPosition={this.changeGlobalPosition}
                            resizeText={this.textSizeCallback}
                            setLanguage={this.setLanguage}
                            nowLanguage={this.state.nowLanguage} 
                            currentStep={this.state.currentStep}
                        />
                        <SofaContent 
                            changeCurrentStep = {this.changeCurrentStep}
                            nowLanguage={this.state.nowLanguage}
                            textSize={this.state.textSize}
                            steps={this.state.steps}
                            stepDesc={this.state.stepDesc}
                            currentStep={this.state.currentStep}
                            lat={this.state.lat}
                            lon={this.state.lon}
                        />
                    </div>
        }
    }
let app = null;
let init=()=>{
    let urlCurr = theUrl+"en";//url to get info by language
    let xhr = new XMLHttpRequest()
    xhr.open("GET", urlCurr, true);
    xhr.onload = function(e){
        let data = JSON.parse(xhr.response);
        let steps = data.steps;//get info about steps
        // console.log(steps)
        ReactDOM.render(
            <App ref={(child)=>app=child} steps={steps}/>,
            document.getElementById('root')
        );
        
    }.bind(app)
    
    xhr.onerror = function(e){
        console.log(e)
    }
    xhr.send();
    console.log(app)
}

init();