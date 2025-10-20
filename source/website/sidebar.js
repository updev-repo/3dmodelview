import { GetDomElementOuterWidth, SetDomElementOuterHeight, SetDomElementOuterWidth } from '../engine/viewer/domutils.js';
import { PanelSet } from './panelset.js';
import { SidebarDetailsPanel } from './sidebardetailspanel.js';
import { SidebarSettingsPanel } from './sidebarsettingspanel.js';
import { SidebarParameterPanel } from './sidebarparameterpanel.js';
import { SidebarMeshTransformPanel } from './sidebarmeshtransformpanel.js';

export class Sidebar
{
    constructor (mainDiv, settings)
    {
        this.mainDiv = mainDiv;
        this.panelSet = new PanelSet (mainDiv);

        this.detailsPanel = new SidebarDetailsPanel (this.panelSet.GetContentDiv ());
        this.settingsPanel = new SidebarSettingsPanel (this.panelSet.GetContentDiv (), settings);
        this.parameterPanel = new SidebarParameterPanel (this.panelSet.GetContentDiv (), settings, {
            onParameterChanged : () => {
                // Parameter changed callback - will be set in Init
            },
            onApplyParameters : () => {
                // Apply parameters callback - will be set in Init
            }
        });
        this.meshTransformPanel = new SidebarMeshTransformPanel (this.panelSet.GetContentDiv (), {
            getMeshTransform : (meshId) => {
                // Get mesh transform callback - will be set in Init
                return null;
            },
            applyMeshTransform : (meshId, transform) => {
                // Apply mesh transform callback - will be set in Init
            }
        });

        this.panelSet.AddPanel (this.detailsPanel);
        this.panelSet.AddPanel (this.settingsPanel);
        this.panelSet.AddPanel (this.parameterPanel);
        this.panelSet.AddPanel (this.meshTransformPanel);
        this.panelSet.ShowPanel (this.detailsPanel);
    }

    IsPanelsVisible ()
    {
        return this.panelSet.IsPanelsVisible ();
    }

    ShowPanels (show)
    {
        this.panelSet.ShowPanels (show);
    }

    Init (callbacks)
    {
        this.callbacks = callbacks;

        this.panelSet.Init ({
            onResizeRequested : () => {
                this.callbacks.onResizeRequested ();
            },
            onShowHidePanels : (show) => {
                this.callbacks.onShowHidePanels (show);
            }
        });

        this.settingsPanel.Init ({
            getShadingType : () => {
                return this.callbacks.getShadingType ();
            },
            getProjectionMode : () => {
                return this.callbacks.getProjectionMode ();
            },
            getDefaultMaterials : () => {
                return this.callbacks.getDefaultMaterials ();
            },
            onEnvironmentMapChanged : () => {
                this.callbacks.onEnvironmentMapChanged ();
            },
            onBackgroundColorChanged : () => {
                this.callbacks.onBackgroundColorChanged ();
            },
            onDefaultColorChanged : () => {
                this.callbacks.onDefaultColorChanged ();
            },
            onEdgeDisplayChanged : () => {
                this.callbacks.onEdgeDisplayChanged ();
            },
            onParameterChanged : () => {
                this.callbacks.onParameterChanged ();
            },
            onApplyParameters : () => {
                this.callbacks.onApplyParameters ();
            },
            getMeshTransform : (meshId) => {
                return this.callbacks.getMeshTransform (meshId);
            },
            applyMeshTransform : (meshId, transform) => {
                this.callbacks.applyMeshTransform (meshId, transform);
            }
        });

        this.parameterPanel.Init ({
            onParameterChanged : () => {
                this.callbacks.onParameterChanged ();
            },
            onApplyParameters : () => {
                this.callbacks.onApplyParameters ();
            }
        });

        // Update the mesh transform panel callbacks directly
        this.meshTransformPanel.transformSection.callbacks = {
            getMeshTransform : (meshId) => {
                return this.callbacks.getMeshTransform (meshId);
            },
            applyMeshTransform : (meshId, transform) => {
                this.callbacks.applyMeshTransform (meshId, transform);
            }
        };
    }

    UpdateControlsStatus ()
    {
        this.settingsPanel.UpdateControlsStatus ();
    }

    UpdateControlsVisibility ()
    {
        this.settingsPanel.UpdateControlsVisibility ();
    }

    Resize (height)
    {
        SetDomElementOuterHeight (this.mainDiv, height);
        this.panelSet.Resize ();
    }

    GetWidth ()
    {
        return GetDomElementOuterWidth (this.mainDiv);
    }

    SetWidth (width)
    {
        SetDomElementOuterWidth (this.mainDiv, width);
    }

    Clear ()
    {
        this.panelSet.Clear ();
    }

    AddObject3DProperties (model, object3D)
    {
        this.detailsPanel.AddObject3DProperties (model, object3D);
    }

    AddMaterialProperties (material)
    {
        this.detailsPanel.AddMaterialProperties (material);
    }

    UpdateParameterSettings (importSettings)
    {
        this.parameterPanel.UpdateSettings (importSettings);
    }

    GetParameterSettings ()
    {
        return this.parameterPanel.settings;
    }

    SetSelectedMesh (meshId)
    {
        this.meshTransformPanel.SetSelectedMesh (meshId);
    }

    ClearSelectedMesh ()
    {
        this.meshTransformPanel.SetSelectedMesh (null);
    }
}
