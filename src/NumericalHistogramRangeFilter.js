import './NumericalHistogramRangeFilter.scss';

export class NumericalHistogramRangeFilter {
    constructor(min, max, histogram) {
        this.min = min;
        this.max = max;
        this.leftBound = this.min;
        this.rightBound = this.max;
        this.histogram = histogram;
        this.totalButtons = 0;

        this.containerNode = null;
        this.containerHistogramNode = null;
        this.histogramsNodes = {};
        this.containerHistogramButtonNode = null;
        this.histogramsButtonsNodes = {};

        this.containerLeftHandleNode = null;
        this.containerRightHandleNode = null;
        this.containerHistogramSublineSelectedRangeNode = null;
        this.inputMin = null;
        this.inputMax = null;

        this.eventHandler = document.createElement('div');
    }

    mount(containerNode) {
        this.containerNode = containerNode;
        this.containerHistogramNode = this.containerNode.querySelector('.nhrf-histogram');
        this.containerHistogramButtonNode = this.containerNode.querySelector('.nhrf-histogram-numeric-buttons');
        this.containerHistogramSublineSelectedRangeNode = this.containerNode.querySelector('.nhrf-histogram-subline-selected-range');

        this.containerHistogramSliderNode = this.containerNode.querySelector('.nhrf-histogram-slider');
        this.containerLeftHandleNode = this.containerNode.querySelector('.nhrf-histogram-slider-handle.left');
        this.containerRightHandleNode = this.containerNode.querySelector('.nhrf-histogram-slider-handle.right');

        this.inputMin = this.containerNode.querySelector('.nhrf-input-min');
        this.inputMax = this.containerNode.querySelector('.nhrf-input-max');

        this.inputMin.addEventListener('blur', () => {
            this.setMin(this.inputMin.value);
            this.eventHandler.dispatchEvent(new CustomEvent('change', {detail: {min: this.min, max: this.max}}));
        });
        this.inputMax.addEventListener('blur', () => {
            this.setMax(this.inputMax.value);
            this.eventHandler.dispatchEvent(new CustomEvent('change', {detail: {min: this.min, max: this.max}}));
        });

        let containerHistogramSliderNodeBoundingRect = null;
        let movingNode = null;
        let mouseMoveListener = (evt) => {
            let left = Math.max(0, Math.abs(evt.pageX - containerHistogramSliderNodeBoundingRect.left));

            if (evt.pageX < containerHistogramSliderNodeBoundingRect.left) {
                left = 0;
            }

            if (evt.pageX > containerHistogramSliderNodeBoundingRect.left + this.containerHistogramSliderNode.offsetWidth) {
                left = this.containerHistogramSliderNode.offsetWidth;
            }

            if (movingNode.classList.contains('left')) {
                left = Math.min(left, this.containerRightHandleNode.offsetLeft - this.containerRightHandleNode.offsetWidth);
            }

            if (movingNode.classList.contains('right')) {
                left = Math.max(left, this.containerLeftHandleNode.offsetLeft + this.containerLeftHandleNode.offsetWidth);
            }

            movingNode.style.left = left + 'px';

            this.refreshRender();
            this.setBoundsFromDimensions(this.containerLeftHandleNode.offsetLeft, this.containerRightHandleNode.offsetLeft);
        };

        let mouseDownListener = (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            containerHistogramSliderNodeBoundingRect = this.containerHistogramSliderNode.getBoundingClientRect();
            movingNode = evt.currentTarget;

            movingNode.classList.add('active');

            document.addEventListener('mouseup', mouseUpListener);
            document.addEventListener('mousemove', mouseMoveListener);
        };

        let mouseUpListener = (evt) => {
            movingNode.classList.remove('active');

            document.removeEventListener('mouseup', mouseUpListener);
            document.removeEventListener('mousemove', mouseMoveListener);

            this.eventHandler.dispatchEvent(new CustomEvent('change', {detail: {min: this.min, max: this.max}}));
        };

        this.containerLeftHandleNode.addEventListener('mousedown', mouseDownListener);
        this.containerRightHandleNode.addEventListener('mousedown', mouseDownListener);
    }

    render() {
        if (null === this.containerNode) {
            throw "NumericalHistogramRangeFilter not mounted before render!";
        }

        this.histogramsNodes = {};
        this.histogramsButtonsNodes = {};
        this.containerHistogramNode.innerHTML = '';
        this.containerHistogramButtonNode.innerHTML = '';
        this.totalButtons = 0;

        for (const [key, value] of Object.entries(this.histogram.slices)) {
            this.createHistogramNode(value);
            this.createHistogramButtonNode(value);
        }

        this.createHistogramButtonNode({start: this.max});

        this.inputMin.value = this.min;
        this.inputMax.value = this.max;
    }

    createHistogramNode(numericalHistogramSlice) {
        let bar = document.createElement('div');
        bar.className = 'nhrf-histogram-bar';

        let handle = document.createElement('div');
        handle.style.height = numericalHistogramSlice.percent + '%';
        handle.className = 'nhrf-histogram-bar-handle';

        handle.addEventListener('click', (evt) => {
            // console.log('setMin:' + numericalHistogramSlice.start);
            // console.log('setMax:' + numericalHistogramSlice.end);

            this.setMin(numericalHistogramSlice.start, false);
            this.setMax(numericalHistogramSlice.end, false);

            this.eventHandler.dispatchEvent(new CustomEvent('change', {detail: {min: this.min, max: this.max}}));
        });


        bar.appendChild(handle);

        this.histogramsNodes[numericalHistogramSlice.start] = bar;
        this.containerHistogramNode.appendChild(bar);
    }

    createHistogramButtonNode(numericalHistogramSlice) {
        let node = document.createElement('div');
        node.className = 'nhrf-histogram-numeric-buttons-button';

        let button = document.createElement('span');
        button.className = 'nhrf-histogram-numeric-buttons-button-text';
        button.innerText = numericalHistogramSlice.start;
        button.dataset.value = numericalHistogramSlice.start;

        button.addEventListener('click', (evt) => {
            let value = parseFloat(evt.currentTarget.dataset.value);
            let minDist = Math.abs(value - this.min);
            let maxDist = Math.abs(value - this.max);
            if (false === this.hasCustomBounds()) {
                if (this.getNodeIndex(evt.currentTarget.parentNode) > Math.abs(this.totalButtons / 2)) {
                    this.setMax(value);
                } else {
                    this.setMin(value);
                }
            } else if (false === this.hasLeftCustomBounds()) {
                this.setMin(value);
            } else if (false === this.hasRightCustomBounds()) {
                this.setMax(value);
            } else if (value < this.min) {
                this.setMin(value);
            } else if (value > this.max) {
                this.setMax(value);
            } else if (minDist >= maxDist) {
                this.setMax(value);
            } else if (minDist <= maxDist) {
                this.setMin(value);
            }
            // else {
            //     console.log('nothing todo here');
            // }

            this.eventHandler.dispatchEvent(new CustomEvent('change', {detail: {min: this.min, max: this.max}}));
        });

        node.appendChild(button);

        this.containerHistogramButtonNode.appendChild(node);

        this.histogramsButtonsNodes[numericalHistogramSlice.start] = node;

        this.totalButtons++;
    }

    setMin(value, ensureLimits) {
        if (undefined === ensureLimits) {
            ensureLimits = true;
        }
        value = parseFloat(value);
        if (ensureLimits && value >= this.max) {
            return;
        }
        this.min = value;
        this.inputMin.value = value;
        this.setHandlePositionFromValue(this.containerLeftHandleNode, value);
    }

    setMax(value, ensureLimits) {
        if (undefined === ensureLimits) {
            ensureLimits = true;
        }
        value = parseFloat(value);

        if (ensureLimits && value <= this.min) {
            return;
        }

        this.max = value;
        this.inputMax.value = value;
        this.setHandlePositionFromValue(this.containerRightHandleNode, value);
    }

    setHandlePositionFromValue(handleNode, value) {
        if (this.histogramsButtonsNodes[value] !== undefined) {
            let bodyRect = this.containerHistogramNode.getBoundingClientRect(),
                elemRect = this.histogramsButtonsNodes[value].getBoundingClientRect(),
                offset = elemRect.left - bodyRect.left;

            handleNode.style.left = Math.ceil(offset) + 'px';
        } else {
            let histoStart = null, histoEnd = null;
            for (const [key, histogramSlice] of Object.entries(this.histogram.slices)) {
                if (value > histogramSlice.start && value < histogramSlice.end) {
                    histoStart = this.histogramsNodes[key].offsetLeft - this.containerHistogramNode.offsetLeft;
                    histoEnd = histoStart + this.histogramsNodes[key].offsetWidth;

                    handleNode.style.left = this.computePixelPositionFromValue(
                        parseFloat(this.histogram.slices[key].start),
                        parseFloat(this.histogram.slices[key].end),
                        histoStart,
                        histoEnd,
                        value
                    ) + 'px';

                    break;
                }
            }
        }
    }

    getNodeIndex(elem) {
        return Array.prototype.indexOf.call(elem.parentNode.childNodes, elem);
    }

    onChange(callback) {
        this.eventHandler.addEventListener('change', (evt) => {
            this.refreshRender();
            callback(evt.detail.min, evt.detail.max)
        });
    }

    hasCustomBounds() {
        return this.hasLeftCustomBounds() || this.hasRightCustomBounds();
    }

    hasLeftCustomBounds() {
        return this.min !== this.leftBound;
    }

    hasRightCustomBounds() {
        return this.max !== this.rightBound;
    }

    refreshRender() {
        let containerHistogramNodeRect = this.containerHistogramNode.getBoundingClientRect(),
            leftHandleRect = this.containerLeftHandleNode.getBoundingClientRect(),
            leftHandlePosition = leftHandleRect.left - containerHistogramNodeRect.left,
            rightHandleRect = this.containerRightHandleNode.getBoundingClientRect(),
            rightHandlePosition = rightHandleRect.left - containerHistogramNodeRect.left;

        this.containerHistogramSublineSelectedRangeNode.style.left = (leftHandlePosition + (this.containerLeftHandleNode.offsetWidth / 2)) + 'px';
        this.containerHistogramSublineSelectedRangeNode.style.width = (rightHandlePosition - leftHandlePosition) + 'px';

        for (const [key, node] of Object.entries(this.histogramsButtonsNodes)) {
            if (this.histogram.slices.hasOwnProperty(key)) {
                if (
                    (this.histogram.slices[key].start >= this.min && this.histogram.slices[key].end <= this.max)
                    || (this.min > this.histogram.slices[key].start && this.min < this.histogram.slices[key].end)
                    || (this.histogram.slices[key].start < this.max && this.histogram.slices[key].end > this.max)
                ) {
                    this.histogramsButtonsNodes[key].classList.remove('disabled');
                    this.histogramsNodes[key].classList.remove('disabled');
                } else {
                    this.histogramsButtonsNodes[key].classList.add('disabled');
                    this.histogramsNodes[key].classList.add('disabled');
                }
            }
        }
    }

    reset() {
        this.setMin(this.leftBound);
        this.setMax(this.rightBound);

        this.eventHandler.dispatchEvent(new CustomEvent('change', {detail: {min: this.min, max: this.max}}));
    }

    setBoundsFromDimensions(offsetLeftHandle, offsetRightHandle) {
        let histoStart = null, histoEnd = null;
        for (const [key, value] of Object.entries(this.histogramsNodes)) {
            histoStart = value.offsetLeft - this.containerHistogramNode.offsetLeft;
            histoEnd = histoStart + value.offsetWidth;
            if (offsetLeftHandle >= histoEnd || offsetRightHandle <= histoStart) {
                value.classList.add('disabled');
            } else {
                value.classList.remove('disabled');
            }

            if (offsetLeftHandle > histoStart && offsetLeftHandle < histoEnd) {
                this.setMin(
                    this.computeValueFromPixelPosition(
                        parseFloat(this.histogram.slices[key].start),
                        parseFloat(this.histogram.slices[key].end),
                        histoStart,
                        histoEnd,
                        offsetLeftHandle
                    )
                );
            }

            if (offsetRightHandle > histoStart && offsetRightHandle < histoEnd) {
                this.setMax(
                    this.computeValueFromPixelPosition(
                        parseFloat(this.histogram.slices[key].start),
                        parseFloat(this.histogram.slices[key].end),
                        histoStart,
                        histoEnd,
                        offsetRightHandle
                    )
                );

            }
        }
    }

    computeValueFromPixelPosition(minValue, maxValue, minPosition, maxPosition, position) {
        return Math.round(minValue + (((position - minPosition) / (maxPosition - minPosition)) * (maxValue - minValue)));
    }

    computePixelPositionFromValue(minValue, maxValue, minPosition, maxPosition, value) {
        return Math.round(minPosition + (((value - minValue) / (maxValue - minValue)) * (maxPosition - minPosition)));
    }
}

export class NumericalHistogram {
    slices = {};
    min = null;
    max = null;
    maxCount = null;


    constructor(rawJsonData) {
        this.min = rawJsonData.min;
        this.max = rawJsonData.max;
        this.maxCount = rawJsonData.maxCount;

        let values = Object.values(rawJsonData.histogram);
        
        values.forEach((slice, key) => {
            this.addSlice(
                new NumericalHistogramSlice(
                    slice.start,
                    undefined !== values[key + 1] ? values[key + 1].start : this.max,
                    slice.count,
                    Math.ceil((100 * slice.count) / this.maxCount)
                )
            );
        });
    }

    addSlice(histogramSlice) {
        this.slices[histogramSlice.start] = histogramSlice;
    }
}

export class NumericalHistogramSlice {
    constructor(start, end, count, percent) {
        this.start = parseFloat(start);
        this.end = parseFloat(end);
        this.count = parseInt(count);
        this.percent = parseInt(percent);
    }

}
