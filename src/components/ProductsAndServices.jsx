import React from 'react';

const ProductsAndServices = () => {
    const handleDownload = () => {
        // Trigger download action
        const link = document.createElement('a');
        link.href = 'path/to/yourfile.exe'; // Update this path to the actual file location
        link.download = 'PODS 3D APP Setup 0.3.0.exe';
        link.click();
    };
    const handleDownload2d = () => {
        // Trigger download action
        const link = document.createElement('a');
        link.href = 'path/to/yourfile.exe'; // Update this path to the actual file location
        link.download = 'my2dapp.exe';
        link.click();
    };

    return (
        <div className="container mt-2" style={{display:'flex'}}>
            <div className="card" style={{ width: '18rem', margin: '0 auto' }}>
                <img src="images/pODS 3D.png" style={{height:'150px'}} className="card-img-top" alt="Product Image" /> 
                <div className="card-body">
                    <h5 className="card-title">Pods 3d Application</h5>
                    <p className="card-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore quae sapiente aliquam assumenda, soluta distinctio, facere cum labore tenetur, qui dolore tempora totam. Facilis, culpa quasi nobis unde repudiandae itaque.</p>
                    <button onClick={handleDownload} className="btn btn-primary">Download .exe</button>
                </div>
            </div>
            <div className="card" style={{ width: '18rem', margin: '0 auto' }}>
                <img src="images/pODS 3D.png" style={{height:'150px'}} className="card-img-top" alt="Product Image" /> 
                <div className="card-body">
                    <h5 className="card-title">Pods 2d Application</h5>
                    <p className="card-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore quae sapiente aliquam assumenda, soluta distinctio, facere cum labore tenetur, qui dolore tempora totam. Facilis, culpa quasi nobis unde repudiandae itaque.</p>
                    <button onClick={handleDownload2d} className="btn btn-primary">Download .exe</button>
                </div>
            </div>
        </div>
    );
};

export default ProductsAndServices;
