(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{"ct+p":function(t,e,i){"use strict";i.r(e),i.d(e,"HomeModule",(function(){return tt}));var o=i("ofXK"),s=i("tyNb"),n=i("3Pt+"),a=i("wO+i"),l=i("pLZG"),r=i("lJxs"),c=i("UXun"),h=i("JX91"),p=i("itXk"),u=i("fXoL"),m=i("kmnG"),d=i("qFsG"),_=i("u47x"),b=i("8LU1"),v=i("FKr1"),g=i("quSY"),y=i("XNiG"),f=i("NXyV"),O=i("VRyK"),w=i("LRne"),A=i("xgIS"),C=i("rDax"),S=i("FtGj"),F=i("nLfN"),L=i("+rOU"),P=i("IzEk"),j=i("eIep"),E=i("vkgz"),R=i("3E0/"),x=i("cH1L"),M=i("vxfF");const k=["panel"];function T(t,e){if(1&t&&(u.Rb(0,"div",0,1),u.fc(2),u.Qb()),2&t){const t=u.cc();u.hc("id",t.id)("ngClass",t._classList)}}const D=["*"];let W=0;class V{constructor(t,e){this.source=t,this.option=e}}class I{}const G=Object(v.n)(I),K=new u.q("mat-autocomplete-default-options",{providedIn:"root",factory:function(){return{autoActiveFirstOption:!1}}});let H=(()=>{class t extends G{constructor(t,e,i){super(),this._changeDetectorRef=t,this._elementRef=e,this._activeOptionChanges=g.a.EMPTY,this.showPanel=!1,this._isOpen=!1,this.displayWith=null,this.optionSelected=new u.n,this.opened=new u.n,this.closed=new u.n,this.optionActivated=new u.n,this._classList={},this.id=`mat-autocomplete-${W++}`,this._autoActiveFirstOption=!!i.autoActiveFirstOption}get isOpen(){return this._isOpen&&this.showPanel}get autoActiveFirstOption(){return this._autoActiveFirstOption}set autoActiveFirstOption(t){this._autoActiveFirstOption=Object(b.b)(t)}set classList(t){this._classList=t&&t.length?t.split(" ").reduce((t,e)=>(t[e.trim()]=!0,t),{}):{},this._setVisibilityClasses(this._classList),this._elementRef.nativeElement.className=""}ngAfterContentInit(){this._keyManager=new _.a(this.options).withWrap(),this._activeOptionChanges=this._keyManager.change.subscribe(t=>{this.optionActivated.emit({source:this,option:this.options.toArray()[t]||null})}),this._setVisibility()}ngOnDestroy(){this._activeOptionChanges.unsubscribe()}_setScrollTop(t){this.panel&&(this.panel.nativeElement.scrollTop=t)}_getScrollTop(){return this.panel?this.panel.nativeElement.scrollTop:0}_setVisibility(){this.showPanel=!!this.options.length,this._setVisibilityClasses(this._classList),this._changeDetectorRef.markForCheck()}_emitSelectEvent(t){const e=new V(this,t);this.optionSelected.emit(e)}_setVisibilityClasses(t){t["mat-autocomplete-visible"]=this.showPanel,t["mat-autocomplete-hidden"]=!this.showPanel}}return t.\u0275fac=function(e){return new(e||t)(u.Mb(u.h),u.Mb(u.l),u.Mb(K))},t.\u0275cmp=u.Gb({type:t,selectors:[["mat-autocomplete"]],contentQueries:function(t,e,i){var o;1&t&&(u.Fb(i,v.f,!0),u.Fb(i,v.e,!0)),2&t&&(u.ic(o=u.ac())&&(e.options=o),u.ic(o=u.ac())&&(e.optionGroups=o))},viewQuery:function(t,e){var i;1&t&&(u.pc(u.L,!0),u.wc(k,!0)),2&t&&(u.ic(i=u.ac())&&(e.template=i.first),u.ic(i=u.ac())&&(e.panel=i.first))},hostAttrs:[1,"mat-autocomplete"],inputs:{disableRipple:"disableRipple",displayWith:"displayWith",autoActiveFirstOption:"autoActiveFirstOption",classList:["class","classList"],panelWidth:"panelWidth"},outputs:{optionSelected:"optionSelected",opened:"opened",closed:"closed",optionActivated:"optionActivated"},exportAs:["matAutocomplete"],features:[u.Ab([{provide:v.c,useExisting:t}]),u.yb],ngContentSelectors:D,decls:1,vars:0,consts:[["role","listbox",1,"mat-autocomplete-panel",3,"id","ngClass"],["panel",""]],template:function(t,e){1&t&&(u.gc(),u.rc(0,T,3,2,"ng-template"))},directives:[o.i],styles:[".mat-autocomplete-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;visibility:hidden;max-width:none;max-height:256px;position:relative;width:100%;border-bottom-left-radius:4px;border-bottom-right-radius:4px}.mat-autocomplete-panel.mat-autocomplete-visible{visibility:visible}.mat-autocomplete-panel.mat-autocomplete-hidden{visibility:hidden}.mat-autocomplete-panel-above .mat-autocomplete-panel{border-radius:0;border-top-left-radius:4px;border-top-right-radius:4px}.mat-autocomplete-panel .mat-divider-horizontal{margin-top:-1px}.cdk-high-contrast-active .mat-autocomplete-panel{outline:solid 1px}\n"],encapsulation:2,changeDetection:0}),t})();const N=new u.q("mat-autocomplete-scroll-strategy"),B={provide:N,deps:[C.a],useFactory:function(t){return()=>t.scrollStrategies.reposition()}},z={provide:n.g,useExisting:Object(u.T)(()=>Q),multi:!0};let Q=(()=>{class t{constructor(t,e,i,o,s,n,a,l,r,c){this._element=t,this._overlay=e,this._viewContainerRef=i,this._zone=o,this._changeDetectorRef=s,this._dir=a,this._formField=l,this._document=r,this._viewportRuler=c,this._componentDestroyed=!1,this._autocompleteDisabled=!1,this._manuallyFloatingLabel=!1,this._viewportSubscription=g.a.EMPTY,this._canOpenOnNextFocus=!0,this._closeKeyEventStream=new y.a,this._windowBlurHandler=()=>{this._canOpenOnNextFocus=this._document.activeElement!==this._element.nativeElement||this.panelOpen},this._onChange=()=>{},this._onTouched=()=>{},this.position="auto",this.autocompleteAttribute="off",this._overlayAttached=!1,this.optionSelections=Object(f.a)(()=>this.autocomplete&&this.autocomplete.options?Object(O.a)(...this.autocomplete.options.map(t=>t.onSelectionChange)):this._zone.onStable.asObservable().pipe(Object(P.a)(1),Object(j.a)(()=>this.optionSelections))),this._scrollStrategy=n}get autocompleteDisabled(){return this._autocompleteDisabled}set autocompleteDisabled(t){this._autocompleteDisabled=Object(b.b)(t)}ngAfterViewInit(){const t=this._getWindow();void 0!==t&&(this._zone.runOutsideAngular(()=>{t.addEventListener("blur",this._windowBlurHandler)}),this._isInsideShadowRoot=!!Object(F.c)(this._element.nativeElement))}ngOnChanges(t){t.position&&this._positionStrategy&&(this._setStrategyPositions(this._positionStrategy),this.panelOpen&&this._overlayRef.updatePosition())}ngOnDestroy(){const t=this._getWindow();void 0!==t&&t.removeEventListener("blur",this._windowBlurHandler),this._viewportSubscription.unsubscribe(),this._componentDestroyed=!0,this._destroyPanel(),this._closeKeyEventStream.complete()}get panelOpen(){return this._overlayAttached&&this.autocomplete.showPanel}openPanel(){this._attachOverlay(),this._floatLabel()}closePanel(){this._resetLabel(),this._overlayAttached&&(this.panelOpen&&this.autocomplete.closed.emit(),this.autocomplete._isOpen=this._overlayAttached=!1,this._overlayRef&&this._overlayRef.hasAttached()&&(this._overlayRef.detach(),this._closingActionsSubscription.unsubscribe()),this._componentDestroyed||this._changeDetectorRef.detectChanges())}updatePosition(){this._overlayAttached&&this._overlayRef.updatePosition()}get panelClosingActions(){return Object(O.a)(this.optionSelections,this.autocomplete._keyManager.tabOut.pipe(Object(l.a)(()=>this._overlayAttached)),this._closeKeyEventStream,this._getOutsideClickStream(),this._overlayRef?this._overlayRef.detachments().pipe(Object(l.a)(()=>this._overlayAttached)):Object(w.a)()).pipe(Object(r.a)(t=>t instanceof v.h?t:null))}get activeOption(){return this.autocomplete&&this.autocomplete._keyManager?this.autocomplete._keyManager.activeItem:null}_getOutsideClickStream(){return Object(O.a)(Object(A.a)(this._document,"click"),Object(A.a)(this._document,"touchend")).pipe(Object(l.a)(t=>{const e=this._isInsideShadowRoot&&t.composedPath?t.composedPath()[0]:t.target,i=this._formField?this._formField._elementRef.nativeElement:null;return this._overlayAttached&&e!==this._element.nativeElement&&(!i||!i.contains(e))&&!!this._overlayRef&&!this._overlayRef.overlayElement.contains(e)}))}writeValue(t){Promise.resolve(null).then(()=>this._setTriggerValue(t))}registerOnChange(t){this._onChange=t}registerOnTouched(t){this._onTouched=t}setDisabledState(t){this._element.nativeElement.disabled=t}_handleKeydown(t){const e=t.keyCode;if(e===S.e&&t.preventDefault(),this.activeOption&&e===S.d&&this.panelOpen)this.activeOption._selectViaInteraction(),this._resetActiveItem(),t.preventDefault();else if(this.autocomplete){const i=this.autocomplete._keyManager.activeItem,o=e===S.n||e===S.b;this.panelOpen||e===S.m?this.autocomplete._keyManager.onKeydown(t):o&&this._canOpen()&&this.openPanel(),(o||this.autocomplete._keyManager.activeItem!==i)&&this._scrollToOption()}}_handleInput(t){let e=t.target,i=e.value;"number"===e.type&&(i=""==i?null:parseFloat(i)),this._previousValue!==i&&(this._previousValue=i,this._onChange(i),this._canOpen()&&this._document.activeElement===t.target&&this.openPanel())}_handleFocus(){this._canOpenOnNextFocus?this._canOpen()&&(this._previousValue=this._element.nativeElement.value,this._attachOverlay(),this._floatLabel(!0)):this._canOpenOnNextFocus=!0}_floatLabel(t=!1){this._formField&&"auto"===this._formField.floatLabel&&(t?this._formField._animateAndLockLabel():this._formField.floatLabel="always",this._manuallyFloatingLabel=!0)}_resetLabel(){this._manuallyFloatingLabel&&(this._formField.floatLabel="auto",this._manuallyFloatingLabel=!1)}_scrollToOption(){const t=this.autocomplete._keyManager.activeItemIndex||0,e=Object(v.k)(t,this.autocomplete.options,this.autocomplete.optionGroups);if(0===t&&1===e)this.autocomplete._setScrollTop(0);else{const i=Object(v.l)(t+e,48,this.autocomplete._getScrollTop(),256);this.autocomplete._setScrollTop(i)}}_subscribeToClosingActions(){const t=this._zone.onStable.asObservable().pipe(Object(P.a)(1)),e=this.autocomplete.options.changes.pipe(Object(E.a)(()=>this._positionStrategy.reapplyLastPosition()),Object(R.a)(0));return Object(O.a)(t,e).pipe(Object(j.a)(()=>{const t=this.panelOpen;return this._resetActiveItem(),this.autocomplete._setVisibility(),this.panelOpen&&(this._overlayRef.updatePosition(),t!==this.panelOpen&&this.autocomplete.opened.emit()),this.panelClosingActions}),Object(P.a)(1)).subscribe(t=>this._setValueAndClose(t))}_destroyPanel(){this._overlayRef&&(this.closePanel(),this._overlayRef.dispose(),this._overlayRef=null)}_setTriggerValue(t){const e=this.autocomplete&&this.autocomplete.displayWith?this.autocomplete.displayWith(t):t,i=null!=e?e:"";this._formField?this._formField._control.value=i:this._element.nativeElement.value=i,this._previousValue=i}_setValueAndClose(t){t&&t.source&&(this._clearPreviousSelectedOption(t.source),this._setTriggerValue(t.source.value),this._onChange(t.source.value),this._element.nativeElement.focus(),this.autocomplete._emitSelectEvent(t.source)),this.closePanel()}_clearPreviousSelectedOption(t){this.autocomplete.options.forEach(e=>{e!=t&&e.selected&&e.deselect()})}_attachOverlay(){if(!this.autocomplete)throw Error("Attempting to open an undefined instance of `mat-autocomplete`. Make sure that the id passed to the `matAutocomplete` is correct and that you're attempting to open it after the ngAfterContentInit hook.");let t=this._overlayRef;t?(this._positionStrategy.setOrigin(this._getConnectedElement()),t.updateSize({width:this._getPanelWidth()})):(this._portal=new L.g(this.autocomplete.template,this._viewContainerRef),t=this._overlay.create(this._getOverlayConfig()),this._overlayRef=t,t.keydownEvents().subscribe(t=>{(t.keyCode===S.e||t.keyCode===S.n&&t.altKey)&&(this._resetActiveItem(),this._closeKeyEventStream.next(),t.stopPropagation(),t.preventDefault())}),this._viewportRuler&&(this._viewportSubscription=this._viewportRuler.change().subscribe(()=>{this.panelOpen&&t&&t.updateSize({width:this._getPanelWidth()})}))),t&&!t.hasAttached()&&(t.attach(this._portal),this._closingActionsSubscription=this._subscribeToClosingActions());const e=this.panelOpen;this.autocomplete._setVisibility(),this.autocomplete._isOpen=this._overlayAttached=!0,this.panelOpen&&e!==this.panelOpen&&this.autocomplete.opened.emit()}_getOverlayConfig(){return new C.b({positionStrategy:this._getOverlayPosition(),scrollStrategy:this._scrollStrategy(),width:this._getPanelWidth(),direction:this._dir})}_getOverlayPosition(){const t=this._overlay.position().flexibleConnectedTo(this._getConnectedElement()).withFlexibleDimensions(!1).withPush(!1);return this._setStrategyPositions(t),this._positionStrategy=t,t}_setStrategyPositions(t){const e={originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},i={originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-autocomplete-panel-above"};let o;o="above"===this.position?[i]:"below"===this.position?[e]:[e,i],t.withPositions(o)}_getConnectedElement(){return this.connectedTo?this.connectedTo.elementRef:this._formField?this._formField.getConnectedOverlayOrigin():this._element}_getPanelWidth(){return this.autocomplete.panelWidth||this._getHostWidth()}_getHostWidth(){return this._getConnectedElement().nativeElement.getBoundingClientRect().width}_resetActiveItem(){this.autocomplete._keyManager.setActiveItem(this.autocomplete.autoActiveFirstOption?0:-1)}_canOpen(){const t=this._element.nativeElement;return!t.readOnly&&!t.disabled&&!this._autocompleteDisabled}_getWindow(){var t;return(null===(t=this._document)||void 0===t?void 0:t.defaultView)||window}}return t.\u0275fac=function(e){return new(e||t)(u.Mb(u.l),u.Mb(C.a),u.Mb(u.O),u.Mb(u.z),u.Mb(u.h),u.Mb(N),u.Mb(x.b,8),u.Mb(m.a,9),u.Mb(o.d,8),u.Mb(M.c))},t.\u0275dir=u.Hb({type:t,selectors:[["input","matAutocomplete",""],["textarea","matAutocomplete",""]],hostAttrs:[1,"mat-autocomplete-trigger"],hostVars:7,hostBindings:function(t,e){1&t&&u.Zb("focusin",(function(){return e._handleFocus()}))("blur",(function(){return e._onTouched()}))("input",(function(t){return e._handleInput(t)}))("keydown",(function(t){return e._handleKeydown(t)})),2&t&&u.Cb("autocomplete",e.autocompleteAttribute)("role",e.autocompleteDisabled?null:"combobox")("aria-autocomplete",e.autocompleteDisabled?null:"list")("aria-activedescendant",e.panelOpen&&e.activeOption?e.activeOption.id:null)("aria-expanded",e.autocompleteDisabled?null:e.panelOpen.toString())("aria-owns",e.autocompleteDisabled||!e.panelOpen||null==e.autocomplete?null:e.autocomplete.id)("aria-haspopup",!e.autocompleteDisabled)},inputs:{position:["matAutocompletePosition","position"],autocompleteAttribute:["autocomplete","autocompleteAttribute"],autocompleteDisabled:["matAutocompleteDisabled","autocompleteDisabled"],autocomplete:["matAutocomplete","autocomplete"],connectedTo:["matAutocompleteConnectedTo","connectedTo"]},exportAs:["matAutocompleteTrigger"],features:[u.Ab([z]),u.zb]}),t})(),X=(()=>{class t{}return t.\u0275mod=u.Kb({type:t}),t.\u0275inj=u.Jb({factory:function(e){return new(e||t)},providers:[B],imports:[[v.g,C.d,v.d,o.c],v.g,v.d]}),t})();var q=i("bTqV");const $=["stars"];function J(t,e){if(1&t&&(u.Rb(0,"mat-option",9),u.sc(1),u.Qb()),2&t){const t=e.$implicit;u.hc("value",t),u.Bb(1),u.uc(" ",t.title," ")}}function Y(t,e){if(1&t&&(u.Rb(0,"mat-optgroup",7),u.rc(1,J,2,2,"mat-option",8),u.Qb()),2&t){const t=e.$implicit;u.hc("label",t.title),u.Bb(1),u.hc("ngForOf",t.items)}}const U=[{path:"",component:(()=>{class t{constructor(t,e){this.router=t,this.route=e,this.what=new n.b("",n.m.compose([n.m.required,t=>"string"==typeof t.value?{type:!0}:null])),this.layerGroups$=this.route.data.pipe(Object(a.a)("capabilities"),Object(l.a)(t=>!!t),Object(r.a)(t=>this.workLayers(t)),Object(c.a)(1)),this.typingText$=this.what.valueChanges.pipe(Object(h.a)(this.what.value),Object(r.a)(t=>t?"string"==typeof t?t.toLocaleLowerCase():(t.title||"").toLocaleLowerCase():"")),this.options$=Object(p.a)([this.layerGroups$,this.typingText$]).pipe(Object(r.a)(([t,e])=>t.map(t=>{const i=t.items.filter(t=>-1!==t.title.toLocaleLowerCase().indexOf(e));return Object.assign(Object.assign({},t),{items:i})}).filter(t=>t.items.length)))}set stars(t){const e=t.nativeElement;e.width=window.innerWidth,e.height=window.innerHeight}ngAfterViewInit(){new WorldWind.WorldWindow("stars").addLayer(new WorldWind.StarFieldLayer)}workLayers(t){const e=new Map;for(const i of Array.from(t.querySelectorAll("Layer>Name"))){const t=i.parentElement,o=this.findGroup(t);let s=e.get(o);s||e.set(o,s=[]),s.push({name:i.innerHTML,title:t.querySelector("Title").innerHTML})}return Array.from(e.entries()).map(([t,e])=>({title:t,items:e}))}findGroup(t){const e=t.parentElement;if("Layer"!==e.parentElement.tagName)return"";{const t=this.findGroup(e),i=e.querySelector("Title").innerHTML;return t?this.findGroup(e)+" - "+i:i}}displayFn(t){return"string"==typeof t?t:t.title}go(t){this.router.navigateByUrl("/timelapse/"+t.name)}}return t.\u0275fac=function(e){return new(e||t)(u.Mb(s.b),u.Mb(s.a))},t.\u0275cmp=u.Gb({type:t,selectors:[["app-home"]],viewQuery:function(t,e){var i;1&t&&u.pc($,!0),2&t&&u.ic(i=u.ac())&&(e.stars=i.first)},decls:13,vars:8,consts:[["id","stars"],["stars",""],["type","text","matInput","","placeholder","What",3,"formControl","matAutocomplete"],[3,"displayWith","autoActiveFirstOption"],["auto","matAutocomplete"],[3,"label",4,"ngFor","ngForOf"],["mat-button","","mat-raised-button","","color","primary",3,"disabled","click"],[3,"label"],[3,"value",4,"ngFor","ngForOf"],[3,"value"]],template:function(t,e){if(1&t&&(u.Nb(0,"canvas",0,1),u.Rb(2,"div"),u.Rb(3,"h1"),u.sc(4,"Earth: How did it change?"),u.Qb(),u.Rb(5,"mat-form-field"),u.Nb(6,"input",2),u.Rb(7,"mat-autocomplete",3,4),u.rc(9,Y,2,2,"mat-optgroup",5),u.dc(10,"async"),u.Qb(),u.Qb(),u.Rb(11,"button",6),u.Zb("click",(function(){return e.go(e.what.value)})),u.sc(12," Show me what you got! "),u.Qb(),u.Qb()),2&t){const t=u.jc(8);u.Bb(6),u.hc("formControl",e.what)("matAutocomplete",t),u.Bb(1),u.hc("displayWith",e.displayFn)("autoActiveFirstOption",!0),u.Bb(2),u.hc("ngForOf",u.ec(10,6,e.options$)),u.Bb(2),u.hc("disabled",!e.what.valid)}},directives:[m.b,d.a,n.a,Q,n.i,n.c,H,o.j,q.b,v.e,v.f],pipes:[o.b],styles:["[_nghost-%COMP%]{display:block;position:relative}[_nghost-%COMP%], [_nghost-%COMP%] > div[_ngcontent-%COMP%]{width:100vw;height:100vh}[_nghost-%COMP%] > div[_ngcontent-%COMP%]{top:0;position:absolute;display:flex;flex-direction:column;justify-content:center;align-items:center}mat-form-field[_ngcontent-%COMP%]{max-width:500px;width:100%}"]}),t})(),resolve:{capabilities:i("Ei5L").a}}];let Z=(()=>{class t{}return t.\u0275mod=u.Kb({type:t}),t.\u0275inj=u.Jb({factory:function(e){return new(e||t)},imports:[[s.d.forChild(U)],s.d]}),t})(),tt=(()=>{class t{}return t.\u0275mod=u.Kb({type:t}),t.\u0275inj=u.Jb({factory:function(e){return new(e||t)},imports:[[o.c,Z,n.l,d.b,m.d,q.c,X]]}),t})()}}]);