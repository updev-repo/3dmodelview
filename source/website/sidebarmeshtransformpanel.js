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
import { Coord3D } from '../engine/geometry/coord3d.js';
import { Transformation } from '../engine/geometry/transformation.js';
import { Matrix } from '../engine/geometry/matrix.js';
import { QuaternionFromXYZ, Quaternion } from '../engine/geometry/quaternion.js';

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

class MeshTransformSection
{
    constructor (parentDiv, callbacks)
    {
        this.callbacks = callbacks;
        this.selectedMeshId = null;

        this.sectionDiv = AddDiv (parentDiv, 'ov_sidebar_section');
        this.sectionTitle = AddDiv (this.sectionDiv, 'ov_sidebar_section_title', Loc ('Mesh Transform'));

        // Position controls
        this.positionDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.positionLabel = AddDiv (this.positionDiv, 'ov_sidebar_setting_label', Loc ('Position'));

        this.positionXDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.positionXLabel = AddDiv (this.positionXDiv, 'ov_sidebar_setting_label', 'X:');
        this.positionXSlider = AddRangeSlider (this.positionXDiv, -50, 50, 0, 0.1, (value) => {
            this.OnPositionChanged ();
        });

        this.positionYDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.positionYLabel = AddDiv (this.positionYDiv, 'ov_sidebar_setting_label', 'Y:');
        this.positionYSlider = AddRangeSlider (this.positionYDiv, -50, 50, 0, 0.1, (value) => {
            this.OnPositionChanged ();
        });

        this.positionZDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.positionZLabel = AddDiv (this.positionZDiv, 'ov_sidebar_setting_label', 'Z:');
        this.positionZSlider = AddRangeSlider (this.positionZDiv, -50, 50, 0, 0.1, (value) => {
            this.OnPositionChanged ();
        });

        // Rotation controls
        this.rotationDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationLabel = AddDiv (this.rotationDiv, 'ov_sidebar_setting_label', Loc ('Rotation'));

        this.rotationXDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationXLabel = AddDiv (this.rotationXDiv, 'ov_sidebar_setting_label', 'X:');
        this.rotationXSlider = AddRangeSlider (this.rotationXDiv, -180, 180, 0, 1, (value) => {
            this.OnRotationChanged ();
        });

        this.rotationYDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationYLabel = AddDiv (this.rotationYDiv, 'ov_sidebar_setting_label', 'Y:');
        this.rotationYSlider = AddRangeSlider (this.rotationYDiv, -180, 180, 0, 1, (value) => {
            this.OnRotationChanged ();
        });

        this.rotationZDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.rotationZLabel = AddDiv (this.rotationZDiv, 'ov_sidebar_setting_label', 'Z:');
        this.rotationZSlider = AddRangeSlider (this.rotationZDiv, -180, 180, 0, 1, (value) => {
            this.OnRotationChanged ();
        });

        // Scale controls
        this.scaleDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.scaleLabel = AddDiv (this.scaleDiv, 'ov_sidebar_setting_label', Loc ('Scale'));

        this.scaleXDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.scaleXLabel = AddDiv (this.scaleXDiv, 'ov_sidebar_setting_label', 'X:');
        this.scaleXSlider = AddRangeSlider (this.scaleXDiv, 0.1, 5, 1, 0.1, (value) => {
            this.OnScaleChanged ();
        });

        this.scaleYDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.scaleYLabel = AddDiv (this.scaleYDiv, 'ov_sidebar_setting_label', 'Y:');
        this.scaleYSlider = AddRangeSlider (this.scaleYDiv, 0.1, 5, 1, 0.1, (value) => {
            this.OnScaleChanged ();
        });

        this.scaleZDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.scaleZLabel = AddDiv (this.scaleZDiv, 'ov_sidebar_setting_label', 'Z:');
        this.scaleZSlider = AddRangeSlider (this.scaleZDiv, 0.1, 5, 1, 0.1, (value) => {
            this.OnScaleChanged ();
        });

        // Uniform scale toggle
        this.uniformScaleDiv = AddDiv (this.sectionDiv, 'ov_sidebar_setting');
        this.uniformScaleToggle = AddToggle (this.uniformScaleDiv, Loc ('Uniform Scale'), true, (value) => {
            this.OnUniformScaleChanged ();
        });

        // Reset button
        this.resetButton = AddDiv (this.sectionDiv, 'ov_button ov_panel_button outline', Loc ('Reset Transform'));
        this.resetButton.addEventListener ('click', () => {
            this.ResetTransform ();
        });

        // Apply button
        this.applyButton = AddDiv (this.sectionDiv, 'ov_button ov_panel_button', Loc ('Apply Transform'));
        this.applyButton.addEventListener ('click', () => {
            this.ApplyTransform ();
        });

        this.SetEnabled (false);
    }

    SetSelectedMesh (meshId)
    {
        this.selectedMeshId = meshId;
        this.SetEnabled (meshId !== null);

        if (meshId !== null) {
            // Load current transform values from the mesh
            this.LoadCurrentTransform ();
        }
    }

    SetEnabled (enabled)
    {
        this.positionXSlider.disabled = !enabled;
        this.positionYSlider.disabled = !enabled;
        this.positionZSlider.disabled = !enabled;
        this.rotationXSlider.disabled = !enabled;
        this.rotationYSlider.disabled = !enabled;
        this.rotationZSlider.disabled = !enabled;
        this.scaleXSlider.disabled = !enabled;
        this.scaleYSlider.disabled = !enabled;
        this.scaleZSlider.disabled = !enabled;
        this.uniformScaleToggle.disabled = !enabled;
        this.resetButton.disabled = !enabled;
        this.applyButton.disabled = !enabled;
    }

    LoadCurrentTransform ()
    {
        if (this.selectedMeshId === null) {
            return;
        }

        // Get current transformation from the mesh
        let currentTransform = this.callbacks.getMeshTransform (this.selectedMeshId);
        if (currentTransform) {
            // Extract position, rotation, and scale from transformation matrix
            let matrix = currentTransform.GetMatrix ();
            let elements = matrix.Get ();

            // Extract position (translation)
            let position = new Coord3D (elements[12], elements[13], elements[14]);
            this.positionXSlider.value = position.x;
            this.positionYSlider.value = position.y;
            this.positionZSlider.value = position.z;

            // Extract scale (from matrix diagonal)
            let scaleX = Math.sqrt (elements[0] * elements[0] + elements[1] * elements[1] + elements[2] * elements[2]);
            let scaleY = Math.sqrt (elements[4] * elements[4] + elements[5] * elements[5] + elements[6] * elements[6]);
            let scaleZ = Math.sqrt (elements[8] * elements[8] + elements[9] * elements[9] + elements[10] * elements[10]);

            this.scaleXSlider.value = scaleX;
            this.scaleYSlider.value = scaleY;
            this.scaleZSlider.value = scaleZ;

            // Reset rotation for now (complex to extract from matrix)
            this.rotationXSlider.value = 0;
            this.rotationYSlider.value = 0;
            this.rotationZSlider.value = 0;
        } else {
            // Reset to default values
            this.ResetTransform ();
        }
    }

    OnPositionChanged ()
    {
        if (this.uniformScaleToggle.checked) {
            this.OnUniformScaleChanged ();
        }
    }

    OnRotationChanged ()
    {
        // Rotation change handling
    }

    OnScaleChanged ()
    {
        if (this.uniformScaleToggle.checked) {
            this.OnUniformScaleChanged ();
        }
    }

    OnUniformScaleChanged ()
    {
        if (this.uniformScaleToggle.checked) {
            // Make all scale values the same as X
            let uniformScale = this.scaleXSlider.value;
            this.scaleYSlider.value = uniformScale;
            this.scaleZSlider.value = uniformScale;
        }
    }

    ResetTransform ()
    {
        this.positionXSlider.value = 0;
        this.positionYSlider.value = 0;
        this.positionZSlider.value = 0;
        this.rotationXSlider.value = 0;
        this.rotationYSlider.value = 0;
        this.rotationZSlider.value = 0;
        this.scaleXSlider.value = 1;
        this.scaleYSlider.value = 1;
        this.scaleZSlider.value = 1;
    }

    ApplyTransform ()
    {
        console.log('~~~~~~~~~1~~~~~~~~~~~~434343');

        if (this.selectedMeshId === null) {
            return;
        }
        console.log('~~~~~~~~~~~2~~~~~~~~~~~');


        // Create transformation matrix from current values
        let position = new Coord3D (
            this.positionXSlider.value,
            this.positionYSlider.value,
            this.positionZSlider.value
        );
        console.log('~~~~~~~~~~~~~3~~~~~~~~~');


        let rotation = new Coord3D (
            this.rotationXSlider.value * Math.PI / 180,
            this.rotationYSlider.value * Math.PI / 180,
            this.rotationZSlider.value * Math.PI / 180
        );
        console.log('~~~~~~~~~~4~~~~~~~~~~~~');

        let scale = new Coord3D (
            this.scaleXSlider.value,
            this.scaleYSlider.value,
            this.scaleZSlider.value
        );
        console.log('~~~~~~~~~~~~5~~~~~~~~~~');


        // Create transformation matrix
        let transform = this.CreateTransformationMatrix (position, rotation, scale);
        console.log('~~~~~~~~~~~6~~~~~~~~~~~');

        // Apply transformation to the selected mesh
        this.callbacks.applyMeshTransform (this.selectedMeshId, transform);
        console.log('~~~~~~~~~~~7~~~~~~~~~~~');
    }

    CreateTransformationMatrix (position, rotation, scale)
    {
        // Create a transformation matrix from position, rotation, and scale
        let matrix = new Matrix ();

        // Convert Euler angles to quaternion
        let quaternion = QuaternionFromXYZ (rotation.x, rotation.y, rotation.z, 'XYZ');

        // Check if quaternion conversion was successful
        if (quaternion === null) {
            console.error('Failed to convert Euler angles to quaternion');
            // Fallback to identity quaternion
            quaternion = new Quaternion(0, 0, 0, 1);
        }

        // Use the proper ComposeTRS method
        matrix.ComposeTRS (position, quaternion, scale);

        return new Transformation (matrix);
    }
}

export class SidebarMeshTransformPanel extends SidebarPanel
{
    constructor (parentDiv, callbacks)
    {
        super (parentDiv);
        this.callbacks = callbacks;

        this.sectionsDiv = AddDiv (this.contentDiv, 'ov_sidebar_settings_sections ov_thin_scrollbar');
        this.transformSection = new MeshTransformSection (this.sectionsDiv, this.callbacks);

        this.noSelectionDiv = AddDiv (this.contentDiv, 'ov_sidebar_no_selection');
        this.noSelectionText = AddDiv (this.noSelectionDiv, 'ov_sidebar_no_selection_text', Loc ('Select a mesh to transform'));
    }

    GetName ()
    {
        return Loc ('Mesh Transform');
    }

    GetIcon ()
    {
        return 'meshes';
    }

    SetSelectedMesh (meshId)
    {
        this.transformSection.SetSelectedMesh (meshId);

        if (meshId !== null) {
            ShowDomElement (this.sectionsDiv, true);
            ShowDomElement (this.noSelectionDiv, false);
        } else {
            ShowDomElement (this.sectionsDiv, false);
            ShowDomElement (this.noSelectionDiv, true);
        }
    }

    Clear ()
    {
        this.SetSelectedMesh (null);
    }
}
