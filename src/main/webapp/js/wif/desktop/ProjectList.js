Ext.require([ 'Ext.Window.*', 'Ext.grid.*', 'Ext.data.*' ]);

Ext
		.define(
				'Wif.desktop.ProjectList',
				{
					extend: 'Ext.ux.desktop.Module',
					requires: [ 'Ext.data.TreeStore', 'Ext.layout.container.Accordion',
							'Ext.toolbar.Spacer', 'Ext.tree.Panel',
							'Wif.model.ProjectsSimpleModel' ],
					id: 'Wif.desktop.ProjectListModule',
					init: function() {
						this.launcher = {
							text: 'Project List',
							iconCls: 'accordion'
						};
						this.initProjects();
					},

					tree: null,

					projects: null,

					window: null,

					initProjects: function() {
						var me = this;
						me.projects = Ext.create('Wif.model.ProjectsSimpleModel', {
							listeners: {
								changed: function(remote, data) {
									me.remoteDataLoaded(data);
								},
								failure: function(remote, status) {
									Ext.Msg.alert('Error', 'Could not load project data');
								},
								beforeverify: function(remote) {
									me.window.setLoading('Loading project data');
								},
								afterverify: function(remote) {
									me.window.setLoading(false);
								}
							}
						});
					},

					remoteDataLoaded: function(data) {
						var me = this;
						var treeData = {
							text: '.',
							expanded: false, //was true
							children: []
						};
						var projectArr = treeData.children;

						for ( var i = 0, j = data.length; i < j; i++) {
							var prj = data[i];
							var prjId = prj._id;
							var projectNode = {
								text: prj.name,
								meta: prj,
								prjId: prjId,
								type: 'project',
								expanded: false, //was true
							};

							var children = [], sceTypes = [ 'suitability', 'demand',
									'demandOutcomes', 'allocationControl', 'allocation' ];
//							
//							var children = [], sceTypes = [ 'suitability', 'demand',
//							    'manualdemand', 'allocationControl', 'allocation' ];

							// new test
							scenarioNodenew = {
								text: 'Setup',
								meta: '',
								prjId: prjId,
								sceId: '',
								type: 'Setup',
								// iconCls : sceType + 'ico',
								leaf: false,
								expanded: true,
								children: [ {
									text: 'Project', //ProjectSetup
									meta: '',
									prjId: prjId,
									sceId: '',
									type: 'ProjectSetup',
									// iconCls : sceType + 'ico',
									leaf: true,
									expanded: false
								}, {
									text: 'Demand',
									meta: '',
									prjId: prjId,
									sceId: '',
									type: 'DemandSetup',
									// iconCls : sceType + 'ico',
									leaf: true,
									expanded: false
//								}, {
//									text: 'ManualDemandSetup',
//									meta: '',
//									prjId: prjId,
//									sceId: '',
//									type: 'ManualDemandSetup',
//									// iconCls : sceType + 'ico',
//									leaf: true,
//									expanded: false
								}, {
									text: 'Allocation',//AllocationSetup
									meta: '',
									prjId: prjId,
									sceId: '',
									type: 'AllocationSetup',
									// iconCls : sceType + 'ico',
									leaf: true,
									expanded: false
								}, {
									text: 'Demographic Trends',
									meta: '',
									prjId: prjId,
									sceId: '',
									type: 'DemographicSetup',
									// iconCls : sceType + 'ico',
									leaf: true,
									expanded: false
								},

								]
							};
							children.push(scenarioNodenew);

							// var childrenNew = [];
							// for (var k = 0, l = sceTypes.length; k < l; k++) {
							// var sceType = sceTypes[k];
							// var scenarios = prj[sceType + 'Scenarios'];
							// for (var s in scenarios) {
							// scenarioNode = {
							// text : scenarios[s] + ' [' + sceType + ']',
							// meta : s,
							// prjId : prjId,
							// sceId : s,
							// type : sceType,
							// iconCls : sceType + 'ico',
							// leaf : true
							// };
							// childrenNew.push(scenarioNode);
							// }
							// }

							var childrenNew = [];
							for ( var k = 0, l = sceTypes.length; k < l; k++) {
								var sceType = sceTypes[k];
								var scenarios = prj[sceType + 'Scenarios'];

								if (sceType == 'demand') {
									// scenarios = prj[sceType + 'ScenarioNews'];
									scenarios = prj[sceType + 'Scenarios'];
								}else if (sceType == 'demandOutcomes') {
									// scenarios = prj[sceType + 'ScenarioNews'];
									scenarios = prj['demandOutcomes']; 
								}
								else {
									scenarios = prj[sceType + 'Scenarios'];
								}

								for ( var s in scenarios) {
									scenarioNode = {
										text: scenarios[s] + ' [' + sceType + ']',
										meta: s,
										prjId: prjId,
										sceId: s,
										type: sceType,
										iconCls: sceType + 'ico',
										leaf: true
									};
									childrenNew.push(scenarioNode);
								}
							}

							scenarioNodenewItems = {
								text: 'Scenarios',
								meta: '',
								prjId: prjId,
								sceId: '',
								type: 'Scenarios',
								// iconCls : sceType + 'ico',
								leaf: false,
								expanded: true,
								children: childrenNew
							};

							children.push(scenarioNodenewItems);
							// /////////////end new

							/*
							 * for (var k = 0, l = sceTypes.length; k < l; k++) { var sceType =
							 * sceTypes[k]; var scenarios = prj[sceType + 'Scenarios']; for
							 * (var s in scenarios) { scenarioNode = { text : scenarios[s] + ' [' +
							 * sceType + ']', meta : s, prjId : prjId, sceId : s, type :
							 * sceType, iconCls : sceType + 'ico', leaf : true };
							 * children.push(scenarioNode); } }
							 */

							projectNode.children = children;
							projectArr.push(projectNode);
						}
						me.tree.store.setRootNode(treeData);
					},

					remoteLoad: function() {
						this.projects.verify();
					},

					// download shape file
					// https://dev-api.aurin.org.au/mservices/download?url=%7BdataStoreURI%7D&userId=%7BuserId%7D&accept=%7Bapplication/zip

					deleteProject: function(projectId) {
						var me = this;
						function serviceHandler(data, status) {
							me.window.setLoading(false);
							if (status != 200 && status != 204) {
								Ext.MessageBox.alert('Failed', 'Could not delete the project.');
							} else {
								delete Wif.db[projectId];
							}
							Wif.eventBus.projectsChanged();
						}

						var serviceParams = {
							xdomain: "cors",
							url: Wif.endpoint + 'projects/' + projectId,
							method: "delete",
							headers: {
								"X-AURIN-USER-ID": Wif.userId
							}
						};
						me.window.setLoading('Deleting ...');
						Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler,
								0, 1);
					},

					deleteSuitabilityScenario: function(projectId, sceId) {
						var me = this;
						function serviceHandler(data, status) {
							me.window.setLoading(false);
							if (status != 200 && status != 204) {
								Ext.MessageBox
										.alert('Failed', 'Could not delete the scenario.');
							} else {
								var proj = Wif.db[projectId];
								if (proj) {
									delete proj[sceId];
								}
							}
							Wif.eventBus.projectsChanged();
						}

						var serviceParams = {
							xdomain: "cors",
							url: Wif.endpoint + 'projects/' + projectId
									+ '/suitabilityScenarios/' + sceId,
							method: "delete",
							headers: {
								"X-AURIN-USER-ID": Wif.userId
							}
						};
						me.window.setLoading('Deleting ...');
						Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler,
								0, 1);
					},

					deletemanualDemandScenario: function(projectId, sceId) {
						var me = this;
						function serviceHandler(data, status) {
							me.window.setLoading(false);
							if (status != 200 && status != 204) {
								Ext.MessageBox.alert('Failed',
										'Could not delete the manual demand scenario.');
							} else {
								var proj = Wif.db[projectId];
								if (proj) {
									delete proj[sceId];
								}
							}
							Wif.eventBus.projectsChanged();
						}

						var serviceParams = {
							xdomain: "cors",
							url: Wif.endpoint + 'projects/' + projectId
									+ '/manualDemandScenarios/' + sceId,
							method: "delete",
							headers: {
								"X-AURIN-USER-ID": Wif.userId
							}
						};
						me.window.setLoading('Deleting ...');
						Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler,
								0, 1);
					},

					deleteDemandScenario: function(projectId, sceId) {
						var me = this;
						function serviceHandler(data, status) {
							me.window.setLoading(false);
							if (status != 200 && status != 204) {
								Ext.MessageBox.alert('Failed',
										'Could not delete the  demand scenario.');
							} else {
								var proj = Wif.db[projectId];
								if (proj) {
									delete proj[sceId];
								}
							}
							Wif.eventBus.projectsChanged();
						}

						var serviceParams = {
							xdomain: "cors",
							url: Wif.endpoint + 'projects/' + projectId
									+ '/demandScenarios/' + sceId,
							method: "delete",
							headers: {
								"X-AURIN-USER-ID": Wif.userId
							}
						};
						me.window.setLoading('Deleting ...');
						Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler,
								0, 1);
					},

					deletAllocationScenario: function(projectId, sceId) {
						var me = this;
						function serviceHandler(data, status) {
							me.window.setLoading(false);
							if (status != 200 && status != 204) {
								Ext.MessageBox.alert('Failed',
										'Could not delete the allocation scenario.');
							} else {
								var proj = Wif.db[projectId];
								if (proj) {
									delete proj[sceId];
								}
							}
							Wif.eventBus.projectsChanged();
						}

						var serviceParams = {
							xdomain: "cors",
							url: Wif.endpoint + 'projects/' + projectId
									+ '/allocationScenarios/' + sceId,
							method: "delete",
							headers: {
								"X-AURIN-USER-ID": Wif.userId
							}
						};
						me.window.setLoading('Deleting ...');
						Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler,
								0, 1);
					},

					deletAllocationControlScenario: function(projectId, sceId) {
						var me = this;
						function serviceHandler(data, status) {
							me.window.setLoading(false);
							if (status != 200 && status != 204) {
								Ext.MessageBox.alert('Failed',
										'Could not delete the allocation control scenario.');
							} else {
								var proj = Wif.db[projectId];
								if (proj) {
									delete proj[sceId];
								}
							}
							Wif.eventBus.projectsChanged();
						}

						var serviceParams = {
							xdomain: "cors",
							url: Wif.endpoint + 'projects/' + projectId
									+ '/AllocationControlScenarios/' + sceId,
							method: "delete",
							headers: {
								"X-AURIN-USER-ID": Wif.userId
							}
						};
						me.window.setLoading('Deleting ...');
						Aura.data.Consumer.getBridgedService(serviceParams, serviceHandler,
								0, 1);
					},

					createTree: function() {
						var me = this;

						var contextMenu = Ext
								.create(
										'Ext.menu.Menu',
										{
											selectedPrj: null,
											items: [
													{
														text: 'Project & Suitability Setup',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'edit prj', project);
															var wizard = Ext.create(
																	'Wif.setup.ProjectWizard', {
																		projectId: projectId
																	});
															_.log(me, 'edit wizard', wizard);
															wizard.build();
														}
													},
													'-',
													{
														text: 'New Suitability Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'new sce', project);

															var suitability = Ext.create(
																	'Wif.analysis.SuitabilityScenario', {
																		projectId: projectId
																	});
															suitability.launch();
														}
													},

													'-',
													{
														text: 'Demand Setup',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'Manual Demand Setup1', project);

															if (project.leaf) {// scenario
																_.log(me, 'only applicable to project');
															} else {
																// var wizard =
																// Ext.create('Wif.setup.demand.DemandShow', {
																// var wizard =
																// Ext.create('Wif.setup.manualdemand.ManualDemandShow',
																// {
																var wizard = Ext.create(
																		'Wif.setup.demandnew.demandnewShow', {
																			projectId: projectId
																		});
																_.log(me, 'Manual demand setup2', wizard);
																wizard.build();
															}
														}
													},
													{
														text: 'New Demand Outcome',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'new desce', project);

															var demand = Ext
																	.create(
																			'Wif.analysis.manualdemand.ManualDemandScenario',
																			{
																				projectId: projectId
																			});
															demand.launch();
														}
													},
													{
														text: 'New Demand Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'new demadsce', project);

															var demandsc = Ext
																	.create(
																			'Wif.analysis.demandscenario.DemandScenarioNew',
																			{
																				projectId: projectId
																			});
															demandsc.launch();

														}
													},
													'-',
													{
														text: 'Allocation Setup',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'Allocation Setup', project);

															if (project.leaf) {
																_.log(me, 'only applicable to project');
															} else {
																var wizard = Ext
																		.create(
																				'Wif.setup.allocation.config.AllocationConfigShow',
																				{
																					projectId: projectId
																				});
																_.log(me, 'Allocation Setup', wizard);
																wizard.build();
															}
														}
													},
													{
														text: 'New Allocation Control Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'Allocation Control Scenario', project);

															if (project.leaf) {// scenario
																_.log(me, 'only applicable to project');
															} else {
																var wizard = Ext
																		.create(
																				'Wif.analysis.allocation.allocationControlScenario',
																				{
																					projectId: projectId
																				});
																_
																		.log(me, 'Allocation Control Scenario',
																				wizard);
																wizard.launch();
															}
														}
													},
													{
														text: 'New Allocation Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'Allocation Scenario', project);

															if (project.leaf) {// scenario
																_.log(me, 'only applicable to project');
															} else {
																var wizard = Ext
																		.create(
																				'Wif.analysis.allocation.allocationScenario',
																				{
																					projectId: projectId
																				});
																_.log(me, 'Allocation Scenario', wizard);
																wizard.launch();
															}
														}
													},
													/*
													 * '-', //Ali { text : 'Demand Show', handler :
													 * function(item) { var project =
													 * item.ownerCt.selectedPrj; var projectId =
													 * project.prjId;
													 * 
													 * _.log(me, 'Demand show', project);
													 * 
													 * if (project.leaf) {// scenario _.log(me, 'only
													 * applicable to project'); } else { var varshow =
													 * Ext.create('Wif.setup.demand.DemandShow', {
													 * projectId : projectId }); _.log(me, 'demand show',
													 * varshow); varshow.build(); } } },
													 */
													/* New Demand scenario */
													/* Divind line */
													/*
													 * { text : 'New Allocation Scenario', handler :
													 * function(item) { var project =
													 * item.ownerCt.selectedPrj; var projectId =
													 * project.prjId;
													 * 
													 * _.log(me, 'New Allocation Scenario', project);
													 * 
													 * if (project.leaf) {// scenario _.log(me, 'only
													 * applicable to project'); } else { var wizard =
													 * Ext.create('Wif.setup.allocation.AllocationWizard', {
													 * projectId : projectId }); _.log(me, 'allocation
													 * setup', wizard); wizard.build(); } } },
													 */
													'-',
													{
														text: 'Delete Project',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'edit prj', project);

															Ext.Msg
																	.show({
																		title: 'Delete project',
																		msg: 'This will delete the project. Would you like to continue?',
																		buttons: Ext.Msg.YESNO,
																		icon: Ext.Msg.QUESTION,
																		fn: function(btn) {
																			if (btn === 'yes') {
																				me.deleteProject(projectId);
																			}
																		}
																	});
														}
													},
													{
														text: 'Save Project',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															var downloadUri = wifUiConfig['appBase']
																	+ 'downloader?'
																	+ _.encodeURL({
																		url: Wif.endpoint + 'projects/' + projectId
																				+ '/report',
																		headers: JSON.stringify({
																			'X-AURIN-USER-ID': Wif.userId
																		}),
																		accept: 'application/json',
																		fileName: project.text + '.json',
																		method: 'get'
																	});
															_.log(me, 'save prj', project, downloadUri);

															Aura.util.ResourceDownload.download({
																method: 'post',
																url: downloadUri
															});
														}
													},
													{
														text: 'Save UAZ File',
														handler: function(item) {

															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															
													   												 
												     	//window.open(url,'_blank');
												      //window.open(Aura.getDispatcher + 'url=' + url);
												      
												     

															var st = "";
															var inst = project.text;

															st = inst.replace(/\s/g, '');
															
															
															//console.log(Wif.endpoint + 'projects/' + projectId	+ '/zipUAZ');
															//console.log(st);
														  //window.open('appServlet/restGet', Wif.endpoint + 'projects/' + projectId	+ '/zipUAZ', st);
															//console.log('appServlet/restGet?url=' + Wif.endpoint + 'projects/' + projectId + '/zipUAZ&prjname=' + st);
															console.log('restGet?url=' + Wif.endpoint + 'projects/' + projectId + '/zipUAZ&prjname=' + st);
														  window.open('restGet?url=' + Wif.endpoint + 'projects/' + projectId + '/zipUAZ&prjname=' + st);
															
															//window.open('appServlet/restGet?url=https://whatif-dev.aurin.org.au/what-if/projects/' + projectId + '/zipUAZ&prjname=' + st);
															
															// var url = Wif.endpoint + 'projects/' + projectId	+ '/zipUAZ';
														
														 // window.open(Aura.getDispatcher + 'url=' + url);
                              
														  /*
															var downloadUri = wifUiConfig['appBase']
																	+ 'downloader?'
																	+ _.encodeURL({
																		url: Wif.endpoint + 'projects/' + projectId
																				+ '/zipUAZ',
																		headers: JSON.stringify({
																			'X-AURIN-USER-ID': Wif.userId
																		}),
																		accept: 'application/zip',
																		fileName: st + '.zip',
																		method: 'get'
																	});
															_.log(me, 'save prj', project, downloadUri);

															Aura.util.ResourceDownload.download({
																method: 'post',
																url: downloadUri
															});
															*/
														}
													}
											// Deferred for next release (beta 4)
											/*
											 * , { text: 'Share project in AURIN', handler:
											 * function(item) { var me = this; var project =
											 * item.ownerCt.selectedPrj; var projectId =
											 * project.prjId; function serviceHandler(data, status) {
											 * if (status != 200 && status != 204) {
											 * Ext.MessageBox.alert('Failed', 'Could not send to
											 * AURIN.'); } else { Ext.MessageBox.alert('Success', 'The
											 * upload started correctly.'); } }
											 * Ext.MessageBox.alert('Notice', 'Sharing a project in
											 * AURIN may take several minutes. ' + 'Please check AURIN
											 * to see if the process has completed.');
											 * 
											 * var serviceParams = { xdomain: "cors" , url:
											 * Wif.endpoint + 'projects/' + projectId + '/upload' ,
											 * method: "post" , headers: { "X-AURIN-USER-ID":
											 * Wif.userId } };
											 * Aura.data.Consumer.getBridgedService(serviceParams,
											 * serviceHandler, 0, 1); } }
											 */
											]
										});

						var contextMenuScenario = Ext
								.create(
										'Ext.menu.Menu',
										{
											selectedPrj: null,
											items: [
													{
														text: 'New Suitability Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'new sce', project);

															var suitability = Ext.create(
																	'Wif.analysis.SuitabilityScenario', {
																		projectId: projectId
																	});
															suitability.launch();
														}
													},
													{
														text: 'New Demand Outcome',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'new desce', project);

															var demand = Ext
																	.create(
																			'Wif.analysis.manualdemand.ManualDemandScenario',
																			{
																				projectId: projectId
																			});
															demand.launch();
														}
													},
													{
														text: 'New Demand Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'new demadsce', project);

															var demandsc = Ext
																	.create(
																			'Wif.analysis.demandscenario.DemandScenarioNew',
																			{
																				projectId: projectId
																			});
															demandsc.launch();

														}
													},
													{
														text: 'New Allocation Control Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'Allocation Control Scenario', project);

															if (project.leaf) {// scenario
																_.log(me, 'only applicable to project');
															} else {
																var wizard = Ext
																		.create(
																				'Wif.analysis.allocation.allocationControlScenario',
																				{
																					projectId: projectId
																				});
																_
																		.log(me, 'Allocation Control Scenario',
																				wizard);
																wizard.launch();
															}
														}
													},
													{
														text: 'New Allocation Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'Allocation Scenario', project);

															if (project.leaf) {// scenario
																_.log(me, 'only applicable to project');
															} else {
																var wizard = Ext
																		.create(
																				'Wif.analysis.allocation.allocationScenario',
																				{
																					projectId: projectId
																				});
																_.log(me, 'Allocation Scenario', wizard);
																wizard.launch();
															}
														}
													}

											]
										});

						var contextMenuSetup = Ext.create('Ext.menu.Menu', {
							selectedPrj: null,
							items: [
									{
										text: 'Project & Suitability Setup',
										handler: function(item) {
											var project = item.ownerCt.selectedPrj;
											var projectId = project.prjId;
											_.log(me, 'edit prj', project);
											var wizard = Ext.create('Wif.setup.ProjectWizard', {
												projectId: projectId
											});
											_.log(me, 'edit wizard', wizard);
											wizard.build();
										}
									},
									'-',
									{
										text: 'Demand Setup',
										handler: function(item) {
											var project = item.ownerCt.selectedPrj;
											var projectId = project.prjId;

											_.log(me, 'Manual Demand Setup1', project);

											if (project.leaf) {// scenario
												_.log(me, 'only applicable to project');
											} else {
												// var wizard =
												// Ext.create('Wif.setup.demand.DemandShow', {
												// var wizard =
												// Ext.create('Wif.setup.manualdemand.ManualDemandShow',
												// {
												var wizard = Ext.create(
														'Wif.setup.demandnew.demandnewShow', {
															projectId: projectId
														});
												_.log(me, 'Manual demand setup2', wizard);
												wizard.build();
											}
										}
									},
									'-',
									{
										text: 'Allocation Setup',
										handler: function(item) {
											var project = item.ownerCt.selectedPrj;
											var projectId = project.prjId;

											_.log(me, 'Allocation Setup', project);

											if (project.leaf) {
												_.log(me, 'only applicable to project');
											} else {
												var wizard = Ext.create(
														'Wif.setup.allocation.config.AllocationConfigShow',
														{
															projectId: projectId
														});
												_.log(me, 'Allocation Setup', wizard);
												wizard.build();
											}
										}
									} ]
						});

						var editMenu = Ext
								.create(
										'Ext.menu.Menu',
										{
											selectedPrj: null,
											items: [
													{
														text: 'Open Scenario',
														handler: function(item) {
															_.log(me, 'editMenu');
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;

															_.log(me, 'editMenu', 'projectId', projectId);
															_.log(me, 'editMenu', 'project', project);

															if (project.leaf) {

																if (project.type === 'suitability') {
																	var suitability = Ext.create(
																			'Wif.analysis.SuitabilityScenario', {
																				projectId: projectId,
																				scenarioId: project.sceId
																			});
																	if (!(projectId in Wif.db)) {
																		Wif.db[projectId] = {};
																	}
																	Wif.db[projectId][project.sceId] = suitability;

																	_.log(me, 'edit wizard', project);
																	suitability.launch();
																}

																if (project.type === 'demandOutcomes') {
																	var manualdemand = Ext
																			.create(
																					'Wif.analysis.manualdemand.ManualDemandScenario',
																					{
																						projectId: projectId,
																						scenarioId: project.sceId
																					});
																	if (!(projectId in Wif.db)) {
																		Wif.db[projectId] = {};
																	}
																	Wif.db[projectId][project.sceId] = manualdemand;

																	_
																			.log(me, 'edit manualdemand wizard',
																					project);
																	manualdemand.launch();
																}

																if (project.type === 'demand') {
																	var demand = Ext
																			.create(
																					'Wif.analysis.demandscenario.DemandScenarioNew',
																					{
																						projectId: projectId,
																						scenarioId: project.sceId
																					});
																	if (!(projectId in Wif.db)) {
																		Wif.db[projectId] = {};
																	}
																	Wif.db[projectId][project.sceId] = demand;

																	_.log(me, 'edit demand scenario wizard',
																			project);
																	demand.launch();
																}

																if (project.type === 'allocation') {
																	var allocation = Ext
																			.create(
																					'Wif.analysis.allocation.allocationScenario',
																					{
																						projectId: projectId,
																						scenarioId: project.sceId
																					});
																	if (!(projectId in Wif.db)) {
																		Wif.db[projectId] = {};
																	}
																	Wif.db[projectId][project.sceId] = allocation;

																	_
																			.log(me, 'edit allocation scenario',
																					project);
																	allocation.launch();
																}

																if (project.type === 'allocationControl') {
																	var allocation = Ext
																			.create(
																					'Wif.analysis.allocation.allocationControlScenario',
																					{
																						projectId: projectId,
																						scenarioId: project.sceId
																					});
																	if (!(projectId in Wif.db)) {
																		Wif.db[projectId] = {};
																	}
																	Wif.db[projectId][project.sceId] = allocation;

																	_.log(me, 'edit allocation control scenario',
																			project);
																	allocation.launch();
																}

																// if (project.type === 'demand') {
																// _.log(me, 'editMenu', 'project.type ===
																// demand');
																//
																// var demand =
																// Ext.create('Wif.setup.demand.EnumPopulCard',
																// {
																// projectId : projectId,
																// // scenarioId : project.sceId
																// });
																// // if (!( projectId in Wif.db)) {
																// // Wif.db[projectId] = {};
																// // }
																// // Wif.db[projectId][project.sceId] =
																// suitability;
																//
																// _.log(me, 'edit wizard', project);
																// demand.build();
																// }

																// NEW
																// if (project.type === 'DemandSetup') {
																// _.log(me, 'editMenu', 'project.type ===
																// DemandSetup');
																//            
																// var wizard =
																// Ext.create('Wif.setup.manualdemand.ManualDemandShow',
																// {
																// projectId : projectId
																// });
																// _.log(me, 'Manual demand setup2', wizard);
																// wizard.build();
																//            
																// _.log(me, 'edit wizard', project);
																// demand.build();
																// }

															}
														}
													},
													{
														text: 'Delete Scenario',
														handler: function(item) {
															var project = item.ownerCt.selectedPrj;
															var projectId = project.prjId;
															_.log(me, 'edit prj', project);

															if (project.leaf) {// scenario
																if (project.type === 'suitability') {
																	Ext.Msg
																			.show({
																				title: 'Delete suitability scenario',
																				msg: 'This will delete the suitability scenario. Would you like to continue?',
																				buttons: Ext.Msg.YESNO,
																				icon: Ext.Msg.QUESTION,
																				fn: function(btn) {
																					if (btn === 'yes') {
																						me.deleteSuitabilityScenario(
																								projectId, project.sceId);
																					}
																				}
																			});
																} else if (project.type === 'demandOutcomes') {
																	Ext.Msg
																			.show({
																				title: 'Delete manual demand scenario',
																				msg: 'This will delete the demand scenario. Would you like to continue?',
																				buttons: Ext.Msg.YESNO,
																				icon: Ext.Msg.QUESTION,
																				fn: function(btn) {
																					if (btn === 'yes') {
																						me.deletemanualDemandScenario(
																								projectId, project.sceId);
																					}
																				}
																			});
																} else if (project.type === 'demand') {
																	Ext.Msg
																			.show({
																				title: 'Delete demand scenario',
																				msg: 'This will delete the demand scenario. Would you like to continue?',
																				buttons: Ext.Msg.YESNO,
																				icon: Ext.Msg.QUESTION,
																				fn: function(btn) {
																					if (btn === 'yes') {
																						me.deleteDemandScenario(projectId,
																								project.sceId);
																					}
																				}
																			});
																} else if (project.type === 'allocation') {
																	Ext.Msg
																			.show({
																				title: 'Delete allocation scenario',
																				msg: 'This will delete the allocation scenario. Would you like to continue?',
																				buttons: Ext.Msg.YESNO,
																				icon: Ext.Msg.QUESTION,
																				fn: function(btn) {
																					if (btn === 'yes') {
																						me.deletAllocationScenario(
																								projectId, project.sceId);
																					}
																				}
																			});
																} else if (project.type === 'allocationControl') {
																	Ext.Msg
																			.show({
																				title: 'Delete allocation control scenario',
																				msg: 'This will delete the allocation control scenario. Would you like to continue?',
																				buttons: Ext.Msg.YESNO,
																				icon: Ext.Msg.QUESTION,
																				fn: function(btn) {
																					if (btn === 'yes') {
																						me.deletAllocationControlScenario(
																								projectId, project.sceId);
																					}
																				}
																			});
																} else {
																	Ext.MessageBox.alert('Delete scenario',
																			'Deleting scenarios of that type NYI');
																}
															}
														}
													} ]
										});

						var editMenuSetup = Ext.create('Ext.menu.Menu', {
							selectedPrj: null,
							items: [ {
								text: 'Open Setup',
								handler: function(item) {
									_.log(me, 'editMenu');
									var project = item.ownerCt.selectedPrj;
									var projectId = project.prjId;

									_.log(me, 'editMenuSetup', 'projectId', projectId);
									_.log(me, 'editMenuSetup', 'project', project);

									if (project.leaf) {

										if (project.type === 'ProjectSetup') {

											var projectId = project.prjId;
											_.log(me, 'edit prj', project);
											var wizard = Ext.create('Wif.setup.ProjectWizard', {
												projectId: projectId
											});
											_.log(me, 'edit wizard', wizard);
											wizard.build();

										}

										if (project.type === 'DemandSetup') {

											var projectId = project.prjId;
											// var wizard = Ext.create('Wif.setup.demand.DemandShow',
											// {
											// var wizard =
											// Ext.create('Wif.setup.manualdemand.ManualDemandShow', {
											var wizard = Ext.create(
													'Wif.setup.demandnew.demandnewShow', {
														projectId: projectId
													});
											_.log(me, 'demand setup', wizard);
											wizard.build();
										}

//										if (project.type === 'ManualDemandSetup') {
//
//											var projectId = project.prjId;
//											var wizard = Ext.create(
//													'Wif.setup.manualdemand.ManualDemandShow', {
//														projectId: projectId
//													});
//											_.log(me, 'Manual demand setup', wizard);
//											wizard.build();
//										}

										if (project.type === 'AllocationSetup') {

											var projectId = project.prjId;

											_.log(me, 'Allocation Setup', project);

											var wizard = Ext.create(
													'Wif.setup.allocation.config.AllocationConfigShow', {
														projectId: projectId
													});
											_.log(me, 'Allocation Setup', wizard);
											wizard.build();

										}

										if (project.type === 'DemographicSetup') {

											var projectId = project.prjId;
											var wizard = Ext.create('Wif.setup.trend.trendnewShow', {
												projectId: projectId
											});
											_.log(me, 'DemographicSetup', wizard);
											wizard.build();
										}

									}
								}
							} ]
						});

						var tree = Ext.create('Ext.tree.Panel', {
							id: 'wif-desktop-projects-tree',
							title: 'Project List',
							rootVisible: false,
							lines: false,
							autoScroll: true,
							tools: [ {
								type: 'refresh',
								handler: function(c, t) {
									me.remoteLoad();
								}
							} ],
							store: Ext.create('Ext.data.TreeStore', {
								fields: [ 'text', 'meta', 'prjId', 'sceId', 'type' ]
							}),
							listeners: {
								contextmenu: function(node, e) {
									if (node.leaf) {
										_.log(me, 'contextmenu', node);
									}
								},
								itemcontextmenu: function(view, record, item, index, e) {
									var xy = e.getXY();
									e.stopEvent();
									_.log(me, 'itemcontextmenu record.data.children',
											record.data.children);
									if (record.data.type == 'Setup') {
										contextMenuSetup.selectedPrj = record.data;
										contextMenuSetup.showAt(xy[0], xy[1]);
									} else if (record.data.type == 'Scenarios') {
										contextMenuScenario.selectedPrj = record.data;
										contextMenuScenario.showAt(xy[0], xy[1]);
									} else {
										if (record.data.type == 'suitability'
												|| record.data.type == 'demand'
												|| record.data.type == 'manualdemand'
												|| record.data.type == 'allocationControl'
												|| record.data.type == 'allocation') {
											editMenu.selectedPrj = record.data;
											editMenu.showAt(xy[0], xy[1]);
										} else if (record.data.type == 'ProjectSetup'
												|| record.data.type == 'DemandSetup'
												|| record.data.type == 'ManualDemandSetup'
												|| record.data.type == 'AllocationSetup'
												|| record.data.type == 'DemographicSetup') {
											editMenuSetup.selectedPrj = record.data;
											editMenuSetup.showAt(xy[0], xy[1]);
										} else {
											if (record.data.children) {
												contextMenu.selectedPrj = record.data;
												contextMenu.showAt(xy[0], xy[1]);
											} else {
												editMenu.selectedPrj = record.data;
												editMenu.showAt(xy[0], xy[1]);
											}
										}
									}
								}
							}
						});
						this.tree = tree;

						return tree;
					},

					createWindow: function() {
						var me = this;

						if (!this.window) {
							me.window = this.app.getDesktop().createWindow({
								id: 'wif-desktop-projects-win',
								title: 'Projects',
								width: 450,
								height: 400,
								iconCls: 'accordion',
								animCollapse: false,
								constrainHeader: true,
								bodyBorder: true,
								tbar: {
									xtype: 'toolbar',
									ui: 'plain',
									items: [ {
										tooltip: 'Add a new project',
										text: 'New Project',
										handler: function() {
											Wif.desktopApp.newProject();
										}
									}, {
										tooltip: 'Restore a project',
										text: 'Restore Project',
										handler: function() {
											Wif.desktopApp.restoreProject();
										}
									} ]
								},
								listeners: {
									show: function(wnd, options) {
										me.remoteLoad();
									},
									destroy: function(wnd, options) {
										me.window = null;
									}
								},
								layout: 'accordion',
								border: false,
								items: [ this.createTree() ]
							});
						} else {
							me.window.show();
							Ext.WindowMgr.bringToFront(me.window);
							me.remoteLoad();
						}

						return me.window;
					}
				});
