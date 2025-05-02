package com.example.park;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.FragmentManager;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private EditText addressEditText;
    private ImageButton zoomInButton, zoomOutButton, myLocationButton, favoriteListButton;
    private FusedLocationProviderClient fusedLocationClient;
    private final List<String> favoriteList = new ArrayList<>();

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // UI 요소 초기화
        addressEditText = findViewById(R.id.editText);

        Button confirmButton = findViewById(R.id.button2); // 즐겨찾기 추가 버튼
        ImageButton searchButton = findViewById(R.id.button_search);


        zoomInButton = findViewById(R.id.button_zoom_in);
        zoomOutButton = findViewById(R.id.button_zoom_out);
        myLocationButton = findViewById(R.id.button_my_location);
        favoriteListButton = findViewById(R.id.button_favorite_list);

        // 위치 제공자 초기화
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // 지도 프래그먼트 설정
        FragmentManager fragmentManager = getSupportFragmentManager();
        SupportMapFragment mapFragment = new SupportMapFragment();
        fragmentManager.beginTransaction()
                .replace(R.id.map_container, mapFragment)
                .commit();
        mapFragment.getMapAsync(this);

        // 즐겨찾기에 추가
        confirmButton.setOnClickListener(v -> {
            String address = addressEditText.getText().toString().trim();
            if (!address.isEmpty()) {
                favoriteList.add(address);
                Toast.makeText(MainActivity.this, "즐겨찾기에 추가되었습니다.", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(MainActivity.this, "주소를 입력해 주세요.", Toast.LENGTH_SHORT).show();
            }
        });

        searchButton.setOnClickListener(v -> {
            String address = addressEditText.getText().toString().trim();
            if (!address.isEmpty()) {
                searchAddressAndMoveMap(address);
            } else {
                Toast.makeText(MainActivity.this, "주소를 입력해 주세요.", Toast.LENGTH_SHORT).show();
            }
        });

        // 즐겨찾기 목록 보기
        favoriteListButton.setOnClickListener(v -> {
            if (favoriteList.isEmpty()) {
                Toast.makeText(MainActivity.this, "즐겨찾기가 비어 있습니다.", Toast.LENGTH_SHORT).show();
            } else {
                String[] favoriteArray = favoriteList.toArray(new String[0]);
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("즐겨찾기 목록")
                        .setItems(favoriteArray, (dialog, which) -> {
                            String selectedAddress = favoriteArray[which];
                            searchAddressAndMoveMap(selectedAddress);
                        })
                        .setNegativeButton("닫기", null)
                        .show();
            }
        });

        // 확대 버튼
        zoomInButton.setOnClickListener(v -> {
            if (mMap != null) {
                mMap.animateCamera(CameraUpdateFactory.zoomIn());
            }
        });

        // 축소 버튼
        zoomOutButton.setOnClickListener(v -> {
            if (mMap != null) {
                mMap.animateCamera(CameraUpdateFactory.zoomOut());
            }
        });

        // 내 위치 버튼
        myLocationButton.setOnClickListener(v -> {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST_CODE);
                return;
            }

            fusedLocationClient.getLastLocation().addOnSuccessListener(this, location -> {
                if (location != null && mMap != null) {
                    LatLng myLatLng = new LatLng(location.getLatitude(), location.getLongitude());
                    mMap.clear();
                    mMap.addMarker(new MarkerOptions().position(myLatLng).title("내 위치"));
                    mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(myLatLng, 15));
                } else {
                    Toast.makeText(MainActivity.this, "현재 위치를 가져올 수 없습니다.", Toast.LENGTH_SHORT).show();
                }
            });
        });
    }

    private void searchAddressAndMoveMap(String address) {
        Geocoder geocoder = new Geocoder(MainActivity.this);
        try {
            List<Address> addresses = geocoder.getFromLocationName(address, 1);
            if (addresses != null && !addresses.isEmpty()) {
                Address location = addresses.get(0);
                LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
                mMap.clear();
                mMap.addMarker(new MarkerOptions().position(latLng).title(address));
                mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15));
            } else {
                Toast.makeText(MainActivity.this, "주소를 찾을 수 없습니다.", Toast.LENGTH_SHORT).show();
            }
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(MainActivity.this, "지오코딩 실패. 다시 시도해 주세요.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;
        LatLng seoul = new LatLng(37.5665, 126.9780);
        mMap.addMarker(new MarkerOptions().position(seoul).title("서울"));
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(seoul, 15));
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                myLocationButton.performClick();
            } else {
                Toast.makeText(this, "위치 권한이 필요합니다.", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
