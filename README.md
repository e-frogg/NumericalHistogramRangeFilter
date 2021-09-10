# NumericalHistogramRangeFilter

live demo : https://e-frogg.github.io/NumericalHistogramRangeFilter/

## install
```
git clone https://github.com/e-frogg/NumericalHistogramRangeFilter.git
cd NumericalHistogramRangeFilter
yarn install
```

## build
```
yarn webpack --mode=production --watch
```

## usage
``` javascript
var jsonFilterData = {
        "max": 3039,
        "min": 0,
        "maxCount": 21471,
        "histogram":
            {
                "0": {
                    "start": 0,
                    "count": 1,
                },
                "1": {
                    "start": 1,
                    "count": 114,
                }
               # [...]
            }
    };
    
    var filter = new NHRF.NumericalHistogramRangeFilter(
        jsonFilterData.min,
        jsonFilterData.max,
        new NHRF.NumericalHistogram(jsonFilterData)
    );

    filter.onChange(function (min, max) {
        document.getElementById('result').innerHTML = 'trigger refresh : <br>min=' + min + " <br> max=" + max;
    });

    filter.mount(document.getElementById('nhrf-container'));
    filter.render();
``
