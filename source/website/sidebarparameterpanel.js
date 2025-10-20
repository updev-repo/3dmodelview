import { RGBColor, RGBColorToHexString, RGBAColor, RGBAColorToHexString, ColorComponentFromFloat } from '../engine/model/color.js';
import { AddDiv, AddDomElement, ShowDomElement, SetDomElementOuterHeight } from '../engine/viewer/domutils.js';
import { AddRangeSlider, AddToggle, AddCheckbox } from '../website/utils.js';
import { CalculatePopupPositionToElementTopLeft } from './dialogs.js';
import { PopupDialog } from './dialog.js';
import { Settings } from './settings.js';
import { SidebarPanel } from './sidebarpanel.js';
import { ShadingType } from '../engine/threejs/threeutils.js';
import { ProjectionMode } from '../engine/viewer/camera.js';
import { Loc } from '../engine/core/localization.js';
import { ImportSettings } from '../engine/import/importer.js';

import * as Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/monolith.min.css';

function AddColorPicker (parentDiv, opacity, defaultColor, predefinedColors, onChange)
{
    let pickr = Pickr.create ({
        el : parentDiv,
        theme : 'monolith',
        position : 'left-start',
        swatches : predefinedColors,
        comparison : false,
        default : defaultColor,
        components : {
            preview : false,
            opacity : opacity,
            hue : true,
            interaction: {
                hex : false,
                rgba : false,
                hsla : false,
                hsva : false,
                cmyk : false,
                input : true,
                clear : false,
                save : false
            }
        }
    });
    pickr.on ('change', (color, source, instance) => {
        let rgbaColor = color.toRGBA ();
        onChange (
            parseInt (rgbaColor[0], 10),
            parseInt (rgbaColor[1], 10),
            parseInt (rgbaColor[2], 10),
            ColorComponentFromFloat (rgbaColor[3])
        );
    });
    return pickr;
}

class ParameterTransformSection
{
    constructor (parentDiv, settings, callbacks)
    {
        this.settings = settings;
        this.callbacks = callbacks;

        this.sectionDiv = AddDiv (parentDiv, 'ov_sidebar_section');
        this.sectionTitle = AddDiv (this.sectionDiv, 'ov_sidebar_section_title', Loc ('Transform'));

        // Scale
        this.scaleDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.scaleLabel = AddDiv (this.scaleDiv, 'ov_sidebar_setting_label', Loc ('Scale'));
        this.scaleSlider = AddRangeSlider (this.scaleDiv, 0.1, 10.0, 1.0, 0.1, (value) => {
            this.settings.scale = value;
            this.callbacks.onParameterChanged ();
        });

        // Rotation
        this.rotationDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationLabel = AddDiv (this.rotationDiv, 'ov_sidebar_setting_label', Loc ('Rotation'));

        this.rotationXDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationXLabel = AddDiv (this.rotationXDiv, 'ov_sidebar_setting_label', 'X:');
        this.rotationXSlider = AddRangeSlider (this.rotationXDiv, -180, 180, 0, 1, (value) => {
            this.settings.rotationX = value;
            this.callbacks.onParameterChanged ();
        });

        this.rotationYDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationYLabel = AddDiv (this.rotationYDiv, 'ov_sidebar_setting_label', 'Y:');
        this.rotationYSlider = AddRangeSlider (this.rotationYDiv, -180, 180, 0, 1, (value) => {
            this.settings.rotationY = value;
            this.callbacks.onParameterChanged ();
        });

        this.rotationZDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationZLabel = AddDiv (this.rotationZDiv, 'ov_sidebar_setting_label', 'Z:');
        this.rotationZSlider = AddRangeSlider (this.rotationZDiv, -180, 180, 0, 1, (value) => {
            this.settings.rotationZ = value;
            this.callbacks.onParameterChanged ();
        });

        // Translation
        this.translationDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.translationLabel = AddDiv (this.translationDiv, 'ov_sidebar_setting_label', Loc ('Translation'));

        this.translationXDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.translationXLabel = AddDiv (this.translationXDiv, 'ov_sidebar_setting_label', 'X:');
        this.translationXSlider = AddRangeSlider (this.translationXDiv, -10, 10, 0, 0.1, (value) => {
            this.settings.translationX = value;
            this.callbacks.onParameterChanged ();
        });

        this.translationYDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.translationYLabel = AddDiv (this.translationYDiv, 'ov_sidebar_setting_label', 'Y:');
        this.translationYSlider = AddRangeSlider (this.translationYDiv, -10, 10, 0, 0.1, (value) => {
            this.settings.translationY = value;
            this.callbacks.onParameterChanged ();
        });

        this.translationZDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.translationZLabel = AddDiv (this.translationZDiv, 'ov_sidebar_setting_label', 'Z:');
        this.translationZSlider = AddRangeSlider (this.translationZDiv, -10, 10, 0, 0.1, (value) => {
            this.settings.translationZ = value;
            this.callbacks.onParameterChanged ();
        });
    }

    UpdateSettings (settings)
    {
        this.settings = settings;
        this.scaleSlider.value = settings.scale;
        this.rotationXSlider.value = settings.rotationX;
        this.rotationYSlider.value = settings.rotationY;
        this.rotationZSlider.value = settings.rotationZ;
        this.translationXSlider.value = settings.translationX;
        this.translationYSlider.value = settings.translationY;
        this.translationZSlider.value = settings.translationZ;
    }
}

class ParameterMaterialSection
{
    constructor (parentDiv, settings, callbacks)
    {
        this.settings = settings;
        this.callbacks = callbacks;

        this.sectionDiv = AddDiv (parentDiv, 'ov_sidebar_section');
        this.sectionTitle = AddDiv (this.sectionDiv, 'ov_sidebar_section_title', Loc ('Material'));

        // Opacity
        this.opacityDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.opacityLabel = AddDiv (this.opacityDiv, 'ov_sidebar_setting_label', Loc ('Opacity'));
        this.opacitySlider = AddRangeSlider (this.opacityDiv, 0.0, 1.0, 1.0, 0.01, (value) => {
            this.settings.materialOpacity = value;
            this.callbacks.onParameterChanged ();
        });

        // Roughness
        this.roughnessDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.roughnessLabel = AddDiv (this.roughnessDiv, 'ov_sidebar_setting_label', Loc ('Roughness'));
        this.roughnessSlider = AddRangeSlider (this.roughnessDiv, 0.0, 1.0, 0.5, 0.01, (value) => {
            this.settings.materialRoughness = value;
            this.callbacks.onParameterChanged ();
        });

        // Metalness
        this.metalnessDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.metalnessLabel = AddDiv (this.metalnessDiv, 'ov_sidebar_setting_label', Loc ('Metalness'));
        this.metalnessSlider = AddRangeSlider (this.metalnessDiv, 0.0, 1.0, 0.0, 0.01, (value) => {
            this.settings.materialMetalness = value;
            this.callbacks.onParameterChanged ();
        });
    }

    UpdateSettings (settings)
    {
        this.settings = settings;
        this.opacitySlider.value = settings.materialOpacity;
        this.roughnessSlider.value = settings.materialRoughness;
        this.metalnessSlider.value = settings.materialMetalness;
    }
}

class ParameterDisplaySection
{
    constructor (parentDiv, settings, callbacks)
    {
        this.settings = settings;
        this.callbacks = callbacks;

        this.sectionDiv = AddDiv (parentDiv, 'ov_sidebar_section');
        this.sectionTitle = AddDiv (this.sectionDiv, 'ov_sidebar_section_title', Loc ('Display'));

        // Wireframe mode
        this.wireframeDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.wireframeToggle = AddToggle (this.wireframeDiv, Loc ('Wireframe'), false, (value) => {
            this.settings.wireframeMode = value;
            this.callbacks.onParameterChanged ();
        });

        // Show normals
        this.normalsDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.normalsToggle = AddToggle (this.normalsDiv, Loc ('Show Normals'), false, (value) => {
            this.settings.showNormals = value;
            this.callbacks.onParameterChanged ();
        });

        // Normal length
        this.normalLengthDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.normalLengthLabel = AddDiv (this.normalLengthDiv, 'ov_sidebar_setting_label', Loc ('Normal Length'));
        this.normalLengthSlider = AddRangeSlider (this.normalLengthDiv, 0.1, 5.0, 1.0, 0.1, (value) => {
            this.settings.normalLength = value;
            this.callbacks.onParameterChanged ();
        });
    }

    UpdateSettings (settings)
    {
        this.settings = settings;
        this.wireframeToggle.checked = settings.wireframeMode;
        this.normalsToggle.checked = settings.showNormals;
        this.normalLengthSlider.value = settings.normalLength;
    }
}

class ParameterProcessingSection
{
    constructor (parentDiv, settings, callbacks)
    {
        this.settings = settings;
        this.callbacks = callbacks;

        this.sectionDiv = AddDiv (parentDiv, 'ov_sidebar_section');
        this.sectionTitle = AddDiv (this.sectionDiv, 'ov_sidebar_section_title', Loc ('Processing'));

        // Merge vertices
        this.mergeVerticesDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.mergeVerticesToggle = AddToggle (this.mergeVerticesDiv, Loc ('Merge Vertices'), true, (value) => {
            this.settings.mergeVertices = value;
            this.callbacks.onParameterChanged ();
        });

        // Generate normals
        this.generateNormalsDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.generateNormalsToggle = AddToggle (this.generateNormalsDiv, Loc ('Generate Normals'), true, (value) => {
            this.settings.generateNormals = value;
            this.callbacks.onParameterChanged ();
        });

        // Generate tangents
        this.generateTangentsDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.generateTangentsToggle = AddToggle (this.generateTangentsDiv, Loc ('Generate Tangents'), false, (value) => {
            this.settings.generateTangents = value;
            this.callbacks.onParameterChanged ();
        });
    }

    UpdateSettings (settings)
    {
        this.settings = settings;
        this.mergeVerticesToggle.checked = settings.mergeVertices;
        this.generateNormalsToggle.checked = settings.generateNormals;
        this.generateTangentsToggle.checked = settings.generateTangents;
    }
}

export class SidebarParameterPanel extends SidebarPanel
{
    constructor (parentDiv, settings, callbacks)
    {
        super (parentDiv);
        this.settings = settings;
        this.callbacks = callbacks;

        this.sectionsDiv = AddDiv (this.contentDiv, 'ov_sidebar_settings_sections ov_thin_scrollbar');
        this.transformSection = new ParameterTransformSection (this.sectionsDiv, this.settings, this.callbacks);
        this.materialSection = new ParameterMaterialSection (this.sectionsDiv, this.settings, this.callbacks);
        this.displaySection = new ParameterDisplaySection (this.sectionsDiv, this.settings, this.callbacks);
        this.processingSection = new ParameterProcessingSection (this.sectionsDiv, this.settings, this.callbacks);

        this.resetToDefaultsButton = AddDiv (this.contentDiv, 'ov_button ov_panel_button outline', Loc ('Reset to Defaults'));
        this.resetToDefaultsButton.addEventListener ('click', () => {
            this.ResetToDefaults ();
        });

        this.applyParametersButton = AddDiv (this.contentDiv, 'ov_button ov_panel_button', Loc ('Apply Parameters'));
        this.applyParametersButton.addEventListener ('click', () => {
            this.callbacks.onApplyParameters ();
        });
    }

    GetName ()
    {
        return Loc ('Model Parameters');
    }

    GetIcon ()
    {
        return 'settings';
    }

    ResetToDefaults ()
    {
        this.settings.scale = 1.0;
        this.settings.rotationX = 0.0;
        this.settings.rotationY = 0.0;
        this.settings.rotationZ = 0.0;
        this.settings.translationX = 0.0;
        this.settings.translationY = 0.0;
        this.settings.translationZ = 0.0;
        this.settings.materialOpacity = 1.0;
        this.settings.materialRoughness = 0.5;
        this.settings.materialMetalness = 0.0;
        this.settings.wireframeMode = false;
        this.settings.showNormals = false;
        this.settings.normalLength = 1.0;
        this.settings.mergeVertices = true;
        this.settings.generateNormals = true;
        this.settings.generateTangents = false;

        this.UpdateSettings (this.settings);
        this.callbacks.onParameterChanged ();
    }

    UpdateSettings (settings)
    {
        this.settings = settings;
        this.transformSection.UpdateSettings (settings);
        this.materialSection.UpdateSettings (settings);
        this.displaySection.UpdateSettings (settings);
        this.processingSection.UpdateSettings (settings);
    }

    Clear ()
    {
        // Clear any specific UI state if needed
    }
}
