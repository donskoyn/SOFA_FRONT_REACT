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
    en: "X",
    ru: "X",
    he: "X",
    fr: "X"
    // en: "CLOSE",
    // ru: "ЗАКРЫТЬ",
    // he: "לסגור",
    // fr: "FERMER"
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
    $(window).on( 'resize',
    function(){
        google.maps.event.trigger( map, 'resize' );
    }
  );//resize the map
    setInfoHeight();
}

//TODO fix address error
//TODO remake style appliance for info window and etc...
//TODO make better logic

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
    if(document.getElementsByClassName("info-of-step")[0])
    document.getElementsByClassName("info-of-step")[0].style.textAlign = "right";
    // $(".menu-item p").css("text-align","right");
    
}

function setLeftTextAlign(){
    if(document.getElementsByClassName("info-of-step")[0])
    document.getElementsByClassName("info-of-step")[0].style.textAlign = "left";
    // $(".menu-item p").css("text-align","left");
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
    let title = document.getElementsByClassName("title-text")[0];
    switch(nowLanguage){
        case "en":
            title.innerText = "10 STEPS OF A NEW REPATRIATE";
            break;
        case "ru":
            title.innerText = "10 ШАГОВ НОВОГО РЕПАТРИАНТА";
            break;
        case "he":
            title.innerText = "עשר שלבים של עולה חדש";
            break;
        case "fr":
            title.innerText = "10 ÉTAPES D'UN NOUVEAU RAPATRIANT";
            break;
        default:
            title.innerText = "10 STEPS OF A NEW REPATRIATE";
            break;
    }
}

function changePosition(lat,lon,lang,step){
    myMarker.setPosition({lat:lat,lng:lon});
    map.setCenter({lat:lat,lng:lon});
    app.fillMapWithPlaces(map,lang,step,lat,lon,MIN_KM,MAX_KM,INC);
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
    app.fillMapWithPlaces(map,lang,step,lat,lon,MIN_KM,MAX_KM,INC);//fill the map with markers
}

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

function closeCurrentMarker(step){//close the clicked marker
    unhighlightMarkers(step);
}

function initMap(){//initialize the google map
    bounds = new google.maps.LatLngBounds();
    geocoder = new google.maps.Geocoder;//get the geocoder to decode placeIds in further
    navigator.geolocation.getCurrentPosition(
        function(pos){return app.successMap(pos,"en",0)},
        function(err){return app.errorMap(err,"en",0)}, 
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
                function(pos){return this.successMap(pos,lang,step)},
                function(err){return this.errorMap(err,lang,step)}, 
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
        // console.log(this.props.currentCity)
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
        return <div class="step-header" style={{backgroundColor:stepColors[this.props.currentStep]}}>
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
            addressList: []
        }
    }

    onAddressClick = (place,i)=>{
        this.props.toggleMarkerInfo(place,true);
        highlightMarker(i);
    }

    compareAddressLists = (a,b) => {
        if(a.length!=b.length){
            return true;
        }
        if(a.length==0&&b.length==0){
            return false;
        }
        for(let i=0; i<a.length; i++){
            if(a[i]!=b[i]){
                return true;
            }
        }
        return false;
    }

    componentDidUpdate = (prevProps,prevState) =>{
        if(this.compareAddressLists(this.props.places,prevProps.places)){
            let placesArr = [];
            let hoho = async () => {
                console.log("async statr")
                console.log(this.props)
                this.props.places.forEach((place) => {
                    geocoder.geocode({"placeId":place.placeId},//decode the placeId to get address
                        function(res, status){
                            console.log(status)
                            placesArr.push(this.geocodeFunc(res,status));
                            console.log(placesArr)
                        }.bind(this,placesArr)
                    );
                }, this);
                console.log("placesArr")
                console.log(placesArr)
                this.setState({addressList: placesArr})
            };
            hoho();
        }
    }

    geocodeFunc = (res,status) => {
        console.log(status)
        console.log(res)
        if(status=="OK"){
            let aC = res[0].address_components;
            return `${aC[2].long_name}, ${aC[1].short_name}, ${aC[0].short_name}`;
        }
        else{//TODO what should happen when you dont get the address(it happens a lot more frequently than expected)
            console.log(status);
            return "address error";
        }
    }

    eachAddress = (place, i) =>{
        let addressString = "";
        return <div class={"sofa-address pointable marker"+i} onClick={()=>this.onAddressClick(place,i)}>
                    <img class="img-place" height="24" width="24" src={`http://www.google.com/s2/favicons?domain=${place.url}`}/>
                    <h5 class="name-place">{place.name}</h5>
                    <p class="expand-button">V</p>
                    <p class="address-name">{this.state.addressList[i]}</p>
                </div>
    }

    render(){
        console.log(this.props)
        return <div class={this.props.classText}>
                    {this.props.places.map(this.eachAddress)}
                </div>
    }
}

class InfoAboutMarker extends React.Component{
    
    constructor(props){
        super(props);
    }

    eachPhone = (phone) => {
        return <div class="div-to-make-flex-work">
                    <p class="make-flex">{phone}</p>
                </div>
    }

    eachSchedule = (day ,i) =>{
        return  <div class="marker-info">
                    <p class="make-flex">
                        {weekDay[this.props.nowLanguage][i]}
                    </p>
                    <p class="make-flex">
                        {day}
                    </p>
                </div>
    }

    render(){
        return <div class="info-of-marker">
                    <div class="marker-holder">
                        <button onClick={()=>window.open(`https://www.google.com/maps/dir/?api=1&origin=${myMarker.getPosition().lat()},${myMarker.getPosition().lng()}&destination=${this.props.place.latitude},${this.props.place.longitude}`,`_blank`)} class="marker-btn">{showRouteBtnText[this.props.nowLanguage]}</button>
                        <button onClick={()=>window.open("http://"+this.props.place.url,"_blank")} class="marker-btn">{goToTheSiteBtnText[this.props.nowLanguage]}</button>
                        <button onClick={()=>{this.props.toggleMarkerInfo(null,false);closeCurrentMarker(this.props.currentStep);}} class="marker-btn">{closeBtnText[this.props.nowLanguage]}</button>
                    </div>
                    <div class="div-to-make-flex-work">
                        <h5 class="make-flex">{this.props.place.name}</h5>
                    </div>
                    <h6>{phonesText[this.props.nowLanguage]}</h6>
                    {this.props.place.phones.map(this.eachPhone)}
                    <h6>{scheduleText[this.props.nowLanguage]}</h6>
                    {this.props.place.schedule.map(this.eachSchedule)}
                </div>
    }
}

class DescriptionOfStep extends React.Component{
    
    constructor(props){
        super(props);
        this.state= {
            toShowMarkerInfo: false,
            place: null
        }
    }

    componentWillReceiveProps = () =>{
        this.setState({toShowMarkerInfo: false})
    }

    toggleMarkerInfo = (place,showB) => {
            this.setState({place: place, toShowMarkerInfo: showB});
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
            if(this.state.toShowMarkerInfo){
                return <div class="step-description">
                            <HelpDescription
                                classText="description-help-small"
                                nowLanguage={this.props.nowLanguage}
                                places={this.props.places}
                                currentStep={this.props.currentStep}
                                steps={this.props.steps}
                                toggleMarkerInfo={this.toggleMarkerInfo}
                            />
                            <InfoAboutMarker
                                nowLanguage={this.props.nowLanguage}
                                currentStep={this.props.currentStep}
                                place={this.state.place}
                                toggleMarkerInfo={this.toggleMarkerInfo}
                            />
                        </div>
            }
            else{
                return <div class="step-description">
                            <HelpDescription
                                classText="description-help"
                                nowLanguage={this.props.nowLanguage}
                                places={this.props.places}
                                currentStep={this.props.currentStep}
                                steps={this.props.steps}
                                toggleMarkerInfo={this.toggleMarkerInfo}
                            />
                        </div>
            }
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
                        nowLanguage={this.props.nowLanguage}
                        places={this.props.places}
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
                            currentStep={this.props.currentStep}
                            nowLanguage={this.props.nowLanguage}
                            places={this.props.places}/>
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
        this.props.changeCurrentStep(cS);
        // console.log(steps)
        // setColorHeaderInfo(cS);//set color for header of info according to chosen step
        // setInfo(steps,cS);//set the info according to the step
        this.props.fillMapWithPlaces(map,this.props.nowLanguage,cS,this.props.lat,this.props.lon,MIN_KM,MAX_KM,INC);//fill the map with markers according to the step
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
                            nowLanguage={this.props.nowLanguage}
                            places={this.props.places}
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
                currentCity: "null",
                places: []
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
            this.fillMapWithPlaces(map,lang,this.state.currentStep,this.state.lat,this.state.lon,MIN_KM,MAX_KM,INC);//fill the map with markers
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
                // console.log(steps)
                steps.sort((a,b)=>a.numberOfStep-b.numberOfStep);//sort the array of objects, because steps are not in the right order
                this.setState({steps:steps});
                // console.log(this.state.steps);
                setTitleText(lang);//set new title according to language you chose
                highlightLanguage(lang);//highlight the chosen language
                this.fillMapWithPlaces(map,lang,this.state.currentStep,this.state.lat,this.state.lon,MIN_KM,MAX_KM,INC);//fill the map with markers
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

        fillMapWithPlaces = (map,lang,step,lat,lon,min,max,inc) => {
            if(map!=null){//if the map was initialized
                let urlCurr = theUrl+`step/${lang}/${step+1}/area/${lat}/${lon}/${min}/${max}/${inc}`;//url request
                // console.log(myMarker.getPosition());
                console.log(urlCurr)
                bounds = new google.maps.LatLngBounds();
                bounds.extend(myMarker.getPosition());
                let xhr = new XMLHttpRequest();
                xhr.open("GET", urlCurr, true);
                xhr.onload = function(e){
                    let placesArr = JSON.parse(xhr.response);
                    clearMap();//clear map from markers if threre are already some
                    // console.log(placesArr)
                    this.setState({places: placesArr})
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
                        // fillSofaAddresses(placesArr,lang,step);//fill the div with information about markers
                    }
                    else{
                        let infoOfMarker = $(".info-of-marker");
                        infoOfMarker.empty();
                        $(".sofa-address").empty();
                        console.log("no places found");
                    }
                    
                    hideLoading();
                }.bind(this);
                xhr.send();
            }
            
        }

        successMap = (pos,lang,step) => {
            currentCity = "0";
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;
            setMap(lat,lon,lang,step);
            this.changeGlobalPosition(lat,lon);
            this.setCurrentCity(lat+"|"+lon+"|0");
            return [lat,lon];
        }

        errorMap = (err,lang,step) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            if(app.state.currentCity=="null"){
                let urlCurr = theUrl + `${lang}/city`;
                $.ajax({
                    url: urlCurr
                })
                .then(
                    (data)=>{
                        let cityList = data;
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
                        let currentCity = TelAviv.latitude+"|"+TelAviv.longitude;
                        let lat = TelAviv.latitude;
                        let lon = TelAviv.longitude;
                        setMap(lat,lon,lang,step);
                        // document.getElementsByClassName("the-list")[0].value = currentCity;
                        hideLoading();
                        this.changeGlobalPosition(lat,lon);
                        this.setCurrentCity(lat+"|"+lon+"|"+indexCity);
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
                            places={this.state.places}
                            fillMapWithPlaces={this.fillMapWithPlaces}
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
}

init();