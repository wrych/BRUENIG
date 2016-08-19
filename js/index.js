var clientVersion = '1.4.0T2';
var uniId = 0;

$( document ).ready(function() {
	var body = new BodyArea(uniId++);
	
	var resizer = new AreaResizer();
		
	var headerBannerArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerBannerArea.setWidth('900px')
	headerBannerArea.setHeight('223px')
	headerBannerArea.setOffset({top:'10', left:'10'})
	
	resizer.resizeOffset(headerBannerArea.setOffset, headerBannerArea, 'left', ['mid',-457], -7)
	
	var headerLogoArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerLogoArea.setWidth('173px')
	headerLogoArea.setHeight('40px')
	headerLogoArea.setOffset({top:'3', left:'30'})

	resizer.resizeOffset(headerLogoArea.setOffset, headerLogoArea, 'left', ['mid',-437], 13)
	
	var headerClaimArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerClaimArea.setWidth('440px')
	headerClaimArea.setHeight('40px')
	headerClaimArea.setOffset({top:'3', left:'470'})

	resizer.resizeOffset(headerClaimArea.setOffset, headerClaimArea, 'left', ['mid',3], 453)
	
	var headerArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerArea.setWidth('900px')
	headerArea.setHeight('270px')
	headerArea.setOffset({top:'0', left:'18'})
	headerArea.jElement.addClass('header-area');

	resizer.resizeOffset(headerArea.setOffset, headerArea, 'left', ['mid',-449], 1)
	
	var statusArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	statusArea.setWidth('130px');
	statusArea.setHeight('50px');
	statusArea.setOffset({top:'205', left:'780'});
	
	resizer.resizeOffset(statusArea.setOffset, statusArea, 'left', ['mid',317], 767)
	
	var navigationArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	navigationArea.setWidth('900px')
	navigationArea.setHeight('30px')
	navigationArea.setOffset({top:'235', left:'25'})
	
	resizer.resizeOffset(navigationArea.setOffset, navigationArea, 'left', ['mid',-442], 8)
	
	var footerArea01 = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	footerArea01.setWidth('300px')
	footerArea01.setHeight('100px')
	footerArea01.setOffset({top:'600', left:'600'})
	
	resizer.resizeOffset(footerArea01.setOffset, footerArea01, 'left', ['mid',133], 583)
	resizer.resizeOffset(footerArea01.setOffset, footerArea01, 'top', ['abs',-100], 390)
	
	var footerArea02 = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	footerArea02.setWidth('295px')
	footerArea02.setHeight('7px')
	footerArea02.setOffset({top:'800', left:'605'})
	footerArea02.getJElement().addClass('dectris-background');
	
	resizer.resizeOffset(footerArea02.setOffset, footerArea02, 'left', ['mid',138], 588)
	resizer.resizeOffset(footerArea02.setOffset, footerArea02, 'top', ['abs',-7], 390)
	
	var mainArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	mainArea.jElement.addClass('main-area');
	mainArea.setWidth('900px')
	mainArea.setOffset({top:'290', left:'18'})
	
	resizer.resizeOffset(mainArea.setOffset, mainArea, 'left', ['mid',-449], 1)
	
	// Trigger Resizer to position elements
	resizer.trigger()
	
	// Header, Logo and Title
	var he01 = new BlockArea(headerBannerArea, uniId++, 'xx', 'xx')
	
	var he01_img01 = he01.addWidget(Image,[])
	he01_img01.setSrc('im/Banner_BRUENIG_WEBCLIENT.jpg')
	he01_img01.setWidth('900px');	
	
	var he02 = new BlockArea(headerLogoArea, uniId++, 'xx', 'xx')
	
	var he02_img01 = he02.addWidget(Image,[])
	he02_img01.setSrc('im/dectris_logo_1x.jpg')
	he02_img01.setWidth('173px');
	
	var he03 = new BlockArea(headerClaimArea, uniId++, 'xx', 'xx')
	
	var he03_img01 = he03.addWidget(Image,[])
	he03_img01.setSrc('im/dectris_claim.png')
	he03_img01.setWidth('440px');
	
	// footer, Logo and Address
	var fo01 = new BlockArea(footerArea01, uniId++, 'xx', 'xx')
	
	var fo01_lbl01 = fo01.addWidget(Label,[])
	fo01_lbl01.getJElement().addClass('dectris');
	fo01_lbl01.getJElement().html('<b>DECTRIS Ltd.</b><br>5400 Baden<br>Switzerland<br><b>www.dectris.com<b>');
	
	// Status Header
	var st01 = new BlockArea(statusArea, uniId++, 'xx', 'xx');
	
	// UI Handler
	var ui = new UiHandler(body, mainArea, nv01, resizer);
	var eUi = new EIGERUiHandler(ui);
	
	// Status Header Widget
	var st01_lbl01 = st01.addWidget(Label,[]);
	st01_lbl01.setText('No S/N Found');
	st01_lbl01.setWidth('100px');
	
	eUi.uiConnect(st01_lbl01, eUi.e.detector.config.detector_number, 10);
	
	st01.addNewLine();
	
	var st01_ind01 = st01.addWidget(Indicator,[]);
	st01_ind01.setText('Not Connected');
	st01_ind01.setWidth('120px');
	eUi.uiConnect(st01_ind01, eUi.e.detector.status.state, .2);

	
	// Navigation
	var nv01 = new BlockArea(navigationArea, 1, 'xx', 'xx');
	
	// Adding pages to main
	var pa01 = ui.addView(ViewArea, 'Settings', 'Detector Settings');
	var pa02 = ui.addView(ViewArea, 'Acquire', 'Aquisition Settings');
	var pa03 = ui.addView(ViewArea, 'Exposure', 'Exposure Information');
	var pa04 = ui.addView(ViewArea, 'Data', 'Data Information');
	var pa05 = ui.addView(ViewArea, 'Status', 'EIGER Status Information.');
	var pa06 = ui.addView(ViewArea, 'Log', 'Logs and Information');
	var pa07 = ui.addView(ViewArea, 'Help & Support', 'Information about DECTRIS Ltd. support and help.');
	
	// Adding buttons for pages (navigation)
	var nv01_btn01 = ui.addNavButton(pa01, nv01);
	var nv01_btn02 = ui.addNavButton(pa02, nv01);
	var nv01_btn03 = ui.addNavButton(pa03, nv01);
	var nv01_btn04 = ui.addNavButton(pa04, nv01);
	var nv01_btn05 = ui.addNavButton(pa05, nv01);
	var nv01_btn06 = ui.addNavButton(pa06, nv01);
	var nv01_btn07 = ui.addNavButton(pa07, nv01);
	
	// page1, connection settings
	var p01_con01 = pa01.addWidget(EIGERConSet,[ui, eUi]);
	var p02_set01 = pa02.addWidget(EIGERAcqSet,[ui, eUi]);
	var p03_acq01 = pa03.addWidget(EIGERAcq, [ui, eUi]);
	var p04_dat01 = pa04.addWidget(EIGERData, [ui, eUi]);
	var p05_hlp01 = pa05.addWidget(EIGERStatus, [ui, eUi]);
	var p06_log01 = pa06.addWidget(EIGERLog, [ui, eUi]);
	var p07_hlp01 = pa07.addWidget(EIGERHelp, [ui, eUi]);
    
    //
    pa06.activate = function () {
        p05_log01.activateLog();
    }
    pa06.leave = function () {
        p05_log01.disableLog();
    }
    pa04.activate = function () {
        eUi.e.filewriter.files.update();
    }   

	// Main Area Footer
	
	var ma01 = new BlockArea(mainArea, uniId++, 'xx', 'xx');
	var ma01_lbl01 = ma01.addWidget(Label,[]);
	ma01_lbl01.getJElement().addClass('main-footer')
	ma01_lbl01.setText(sprintf('EIGER Quick Start Client, %s, Copyright: DECTRIS Ltd., Author: Andy Moesch',clientVersion))
});