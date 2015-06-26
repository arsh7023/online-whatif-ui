
Ext.define('Wif.desktop.App', {
    extend: 'Ext.ux.desktop.App',

    requires: [
        'Wif.model.ProjectsSimpleObject',
        'Wif.model.ProjectsSimpleModel',
        'Ext.window.MessageBox',

        'Ext.ux.desktop.ShortcutModel',
        
        'Wif.desktop.ProjectList',
        'Wif.desktop.Settings'
    ],
    
    
  
    init: function() {
        // custom logic before getXYZ methods get called...

        this.callParent();

        // now ready...
    },

    getModules : function(){
        return [
            Ext.create('Wif.desktop.ProjectList')            
        ];
    },

    moduleShow: function (moduleId) {
        var me = this, module = me.getModule(moduleId),
            win = module && module.createWindow();

        if (win) {
            me.desktop.restoreWindow(win);
        }
    },

    getDesktopConfig: function () {
        var me = this, ret = me.callParent();

        return Ext.apply(ret, {
            //cls: 'ux-desktop-black',

            contextMenuItems: [
                { text: 'Change Settings', handler: me.onSettings, scope: me }
            ],

            shortcuts: Ext.create('Ext.data.Store', {
                model: 'Ext.ux.desktop.ShortcutModel',
                data: [
                    { name: 'Project List', iconCls: 'grid-shortcut', module: 'Wif.desktop.ProjectListModule' },
                ]
            }),

            wallpaper: Aura.appPath + 'resources/desktop/wallpapers/wif-wallpaper.png',
            wallpaperStretch: true
        });
    },

    // config for the start menu
    getStartConfig : function() {
        var me = this, ret = me.callParent();

        return Ext.apply(ret, {
            title:  "Hello " + Wif.userId, //'WhatIf Guest',
            iconCls: 'user',
            height: 300,
            toolConfig: {
                width: 100,
                items: [
                    { 
                    	text:'Help',
                        iconCls:'settings',
                        handleMouseEvents : false,
                        href: 'http://docs.aurin.org.au/what-if',
                        hrefTarget: '_blank',
                        scope: me
                      },
                    {
                        text:'New Project',
                        iconCls:'settings',
                        handler: me.newProject,
                        scope: me
                    }
//                    ,{
//                        text:'New Scenario',
//                        iconCls:'settings',
//                        handler: me.newScenario,
//                        scope: me
//                    },                    '-'
                    ,
//                    {
//                        text:'Settings',
//                        iconCls:'settings',
//                        handler: me.onSettings,
//                        scope: me
//                    },
                    '-',
                    {
                        text:'System info',
                        iconCls:'property',
                        handler: me.onSysInfo,
                        scope: me
                    },
                    '-',
                    {
                        text:'Logout',
                        iconCls:'logout',
                        handler: me.onLogout,
                        scope: me
                    }
                ]
            }
        });
    },

    getTaskbarConfig: function () {
        var ret = this.callParent();

        return Ext.apply(ret, {
            quickStart: [
               // { name: 'Accordion Window', iconCls: 'accordion', module: 'acc-win' },
               // { name: 'Grid Window', iconCls: 'icon-grid', module: 'grid-win' }
            ]
        });
    },

    onLogout: function () {
        Ext.Msg.confirm('Logout', 'Are you sure you want to logout?',
        function(btn) {
          if (btn === 'yes') {
            var ctx1 = location.pathname;
            ctx = ctx1.replace("login","");
            ctx =  ctx+ "logout/";
            window.location.replace(ctx);
          } else {
              return false;
          }
        
      });
        
      
    },

    newProject: function () {
      var wizard = Ext.create('Wif.setup.ProjectWizard');
      wizard.build();
    },
    
    restoreProject: function() {
    	var restore = Ext.create('Wif.desktop.ProjectRestore');
    	restore.build();
    },

    //Ghazal
    demandSetup: function () {
     // var wizard = Ext.create('Wif.setup.demand.DemandWizard');
      //ali
      //var wizard = Ext.create('Wif.setup.demand.DemandShow');
      var wizard = Ext.create('Wif.setup.manualdemand.ManualDemandShow');
      wizard.build();
    },

    //Ali
    /*
    demandShow: function () {
      var varshow = Ext.create('Wif.setup.demand.DemandShow');
      varshow.build();
    },
    */
    newScenario: function () {

        var sce = Ext.create('Wif.analysis.SuitabilityScenario');
        sce.build();
        Wif.sce = sce;	
    },
    onSysInfo: function () {
    	var serviceParams = {
              xdomain: "cors"
            , url: Wif.endpoint + 'version'
            , method: "get"
            , params: null
            , headers: {
              "X-AURIN-USER-ID": Wif.userId
              }
            };
    	var serviceHandler = function(data, status) {
    		var serviceVersion = data ? ('<p>Service version: ' + data + '</p>') : '';
    		Ext.MessageBox.alert('Information',
    				'<p>Online WhatIf</p>' +
    				'<p>UI version: ' + Wif.uiVersion + '</p>' +
    				serviceVersion);
    	};
    	Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler, 0, 1);
    },
    onSettings: function () {
        var dlg = new MyDesktop.Settings({
            desktop: this.desktop
        });
        dlg.show();
    }
});
